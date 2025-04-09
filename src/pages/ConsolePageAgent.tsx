import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CONNECT_CONNECTED,
  CONNECT_CONNECTING,
  CONNECT_DISCONNECTED,
} from '../lib/const';

import './ConsolePage.scss';
import Camera from '../components/Camera';
import SettingsComponent from '../components/Settings';
import Avatar from '../components/Avatar';
import ConnectButton from '../components/ConnectButton';
import ConnectMessage from '../components/ConnectMessage';
import AgentMessages from '../components/AgentMessages';

import { getOpenAIClient } from '../lib/openai';

import { useContexts } from '../providers/AppProvider';
import { InputBarAgent } from '../components/InputBarAgent';

import BuiltFunctionDisable from '../components/BuiltFunctionDisable';
import { Profiles } from '../lib/Profiles';
import {
  getAgentMessages,
  clearAgentMessages,
  getAgentSessions,
  createAgentSession,
  sendAgentMessage,
  InputMessage,
  sendAgentClientToolResponseMessage,
  updateSessionStates,
  getSessionStates,
} from '../lib/agentApi';
import { AgentMessageType } from '../types/AgentMessageType';
import { LlmMessage } from '../components/AgentMessage';
import axios from 'axios';

const REFRESH_MESSAGE_INTERVAL = 100;

export function ConsolePageAgent() {
  const {
    threadRef,
    threadJobRef,
    setThreadJob,
    connectStatus,
    setConnectStatus,
    connectMessage,
    setConnectMessage,
    camera_on_handler,
  } = useContexts();

  const [agentMessages, setAgentMessages] = useState<AgentMessageType[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const agentRunningRef = useRef(false);
  useEffect(() => {
    agentRunningRef.current = agentRunning;
  }, [agentRunning]);

  const [listMessagesIng, setListMessagesIng] = useState(false);
  const listMessagesIngRef = useRef(false);
  useEffect(() => {
    listMessagesIngRef.current = listMessagesIng;
  }, [listMessagesIng]);

  useEffect(() => {
    const lastItem: AgentMessageType = agentMessages[agentMessages.length - 1];
    if (lastItem?.block_session || lastItem?.need_approve) {
      setAgentRunning(true);
    } else {
      setAgentRunning(false);
    }
  }, [agentMessages]);

  const [sessionStates, setSessionStates] = useState<any>({});
  const sessionStatesRef = useRef<any>({});
  useEffect(() => {
    sessionStatesRef.current = sessionStates;
  }, [sessionStates]);

  const [sessionId, setSessionId] = useState<string>('');
  const sessionIdRef = useRef<string>(sessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
    if (sessionIdRef.current) {
      // get session states
      (async () => {
        const states = await getSessionStates(sessionIdRef.current);
        setSessionStates(states);
      })();
    }
  }, [sessionId]);

  const listMessages = useCallback(async () => {
    if (!sessionIdRef.current) {
      return;
    }
    setListMessagesIng(true);
    const messages: AgentMessageType[] = await getAgentMessages(
      sessionIdRef.current,
    );
    setAgentMessages(messages);
    setListMessagesIng(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (listMessagesIngRef.current) {
        return;
      }

      const execTools = async () => {
        if (agentMessages.length === 0) {
          return;
        }

        const lastMessage = agentMessages[agentMessages.length - 1];
        if (!lastMessage.block_session) {
          return;
        }

        const msg: LlmMessage = lastMessage?.content;

        if (msg?.type !== 'function_call') {
          return;
        }

        const call_id = msg.call_id || '';

        if (lastMessage?.need_approve && lastMessage?.approve_status === 0) {
          return;
        }

        if (lastMessage?.need_approve && lastMessage?.approve_status === 2) {
          await sendAgentClientToolResponseMessage(
            sessionIdRef.current,
            call_id,
            JSON.stringify({
              result: false,
              message: 'Tool Rejected by user',
            }),
          );
          return;
        }

        if (msg?.name === 'camera_on_or_off') {
          const res = await camera_on_handler({ ...msg?.arguments });
          await sendAgentClientToolResponseMessage(
            sessionIdRef.current,
            call_id,
            res,
          );
          await updateSessionStates(
            sessionIdRef.current,
            'camera_status',
            msg?.arguments,
          );
          console.log(res);
        }
      };
      await execTools();
      await listMessages();
    }, REFRESH_MESSAGE_INTERVAL);
    return () => clearInterval(timer);
  }, [agentMessages, listMessages, camera_on_handler]);

  const setupSession = async () => {
    try {
      const sessions: any = await getAgentSessions();

      if (sessions.length === 0) {
        setSessionId(await createAgentSession());
      } else {
        setSessionId(sessions[0].id);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message);
      }
      throw error;
    }
  };

  const clearMessages = async () => {
    await clearAgentMessages(sessionIdRef.current);
    setAgentMessages([]);
  };

  const stopCurrentStreamJob = async () => {
    if (!threadJobRef.current) {
      return;
    }

    console.log('stopCurrentStreamJob:', threadJobRef.current);

    try {
      const cancelJob = await getOpenAIClient().beta.threads.runs.cancel(
        threadRef.current?.id,
        threadJobRef.current?.id,
      );
      console.log('cancelJob', cancelJob);
    } catch (error) {
      console.log('cancelJob error', JSON.stringify(error));
    }

    setThreadJob(null);
  };

  const sendMessage = async (text: string) => {
    setAgentRunning(true);
    if (!sessionIdRef.current) {
      console.error('Session not found');
      return;
    }

    // may need to add a check to see if the thread is already created
    try {
      const message: InputMessage = {
        role: 'user',
        content: text,
      };
      await sendAgentMessage(sessionIdRef.current, message);
    } catch (error) {
      console.error('sendAssistantMessage error', JSON.stringify(error));
    }

    setAgentRunning(false);
  };

  const connectConversation = useCallback(async () => {
    try {
      setConnectStatus(CONNECT_CONNECTING);
      setConnectMessage('Creating Session...');
      await setupSession();
      setConnectMessage('Listing Messages...');
      await listMessages();
      setConnectStatus(CONNECT_CONNECTED);
      setConnectMessage('');
    } catch (error: any) {
      setConnectStatus(CONNECT_DISCONNECTED);
      const profiles = new Profiles();
      const agentApiUrl = profiles.currentProfile?.agentApiUrl;
      setConnectMessage(`${error.message} with ${agentApiUrl}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Render the application
   */
  return (
    <>
      <div className="content-logs container_bg">
        <div className="content-block conversation">
          <div className="content-block-body" data-conversation-content>
            <ConnectMessage connectMessage={connectMessage} />

            <AgentMessages
              connectStatus={connectStatus}
              messages={agentMessages}
            />
          </div>

          <InputBarAgent
            setMessagesAssistant={setAgentMessages}
            setAgentRunning={setAgentRunning}
            sendAgentMessage={sendMessage}
            stopCurrentStreamJob={stopCurrentStreamJob}
            agentRunning={agentRunning}
            messages={agentMessages}
            clearMessages={clearMessages}
          />
        </div>
      </div>

      <div className="content-right">
        <BuiltFunctionDisable />

        <Avatar />

        <Camera />

        <SettingsComponent connectStatus={connectStatus} />

        <ConnectButton
          connectStatus={connectStatus}
          connectConversation={connectConversation}
        />
      </div>
    </>
  );
}
