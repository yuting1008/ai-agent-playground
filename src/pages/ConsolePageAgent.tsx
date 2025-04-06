import { useCallback, useEffect, useState } from 'react';

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
import { AssistantStream } from 'openai/lib/AssistantStream';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import { useContexts } from '../providers/AppProvider';
import { InputBarAgent } from '../components/InputBarAgent';

import { Run } from 'openai/resources/beta/threads/runs/runs';
import BuiltFunctionDisable from '../components/BuiltFunctionDisable';
import { Profiles } from '../lib/Profiles';
import axios from 'axios';

export function ConsolePageAgent() {
  const {
    assistantRef,
    setLoading,
    threadRef,
    threadJobRef,
    setThreadJob,
    setResponseBuffer,
    recordTokenLatency,
    connectStatus,
    setConnectStatus,
    connectMessage,
    setConnectMessage,
    isDebugModeRef,
    setInputTokens,
    setOutputTokens,
    loadFunctionsTools,
    setMessages,
  } = useContexts();

  const [agentMessages, setAgentMessages] = useState<any[]>([]);

  const [agentRunning, setAgentRunning] = useState(false);

  const [profiles] = useState<Profiles>(new Profiles());

  const { functionsToolsRef, llmInstructions } = useContexts();

  useEffect(() => {
    (async () => {
      if (assistantRef?.current?.id) {
        console.log('llmInstructions updated');
        getOpenAIClient().beta.assistants.update(assistantRef?.current?.id, {
          instructions: llmInstructions,
        });
      }
    })();
  }, [llmInstructions, assistantRef]);

  useEffect(() => {
    const timer = setInterval(() => {
      (async () => {
        if (assistantRef?.current?.id) {
          const currentTime = new Date().toLocaleString();
          getOpenAIClient().beta.assistants.update(assistantRef?.current?.id, {
            instructions: llmInstructions + `\n\n当前时间：${currentTime}`,
          });
          console.log('llmInstructions updated', currentTime);
        }
      })();
    }, 10000);

    return () => clearInterval(timer);
  }, [assistantRef, llmInstructions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setupSession();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function getMessages() {
    const agentApiKey = profiles.currentProfile?.agentApiKey;
    if (!agentApiKey) {
      alert('Agent API key not found');
      return [];
    }

    const agentApiUrl = profiles.currentProfile?.agentApiUrl;
    if (!agentApiUrl) {
      alert('agentApiUrl not found');
      return [];
    }

    const sessionId = '26ba0c52725340d5b2aa15594d0ebfcf';

    try {
      const response = await axios.get(
        `${agentApiUrl}/api/sessions/${sessionId}/messages`,
        {
          headers: {
            accept: 'application/json',
            'api-key': agentApiKey,
          },
        },
      );
      console.log(response.data);
      return response.data?.messages || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return [];
    }
  }

  const setupSession = async () => {
    const messages: any = await getMessages();
    setAgentMessages(messages);
  };

  const functionCallHandler = async (call: any) => {
    console.log('load function call', call);

    const args = JSON.parse(call.function.arguments);

    for (const fc of loadFunctionsTools) {
      if (fc[0].name === call.function.name) {
        const result = {
          name: call.function.name,
          arguments: args,
        };
        setMessages((prevMessages) => [result, ...prevMessages]);
      }
    }

    for (const [definition, handler] of functionsToolsRef.current) {
      if (definition.name === call?.function?.name) {
        return JSON.stringify(await handler({ ...args }));
      }
    }

    return JSON.stringify({
      error: `Function ${call?.function?.name} not found`,
    });
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

  // textCreated - create new assistant message
  const handleAssistantTextCreated = () => {
    appendAssistantMessage('assistant', '');
  };

  // textDelta - append text to last assistant message
  const handleAssistantTextDelta = (delta: any) => {
    recordTokenLatency(delta);

    if (isDebugModeRef.current) {
      console.log('delta', delta);
    }

    if (delta.value != null) {
      setResponseBuffer((latestText) => latestText + delta.value);
      appendAssistantToLastMessage(delta.value);
    }

    if (delta.annotations != null) {
      annotateAssistantLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleAssistantImageFileDone = (image: any) => {
    appendAssistantToLastMessage(
      `\n![${image.file_id}](/api/files/${image.file_id})\n`,
    );
  };

  // toolCallCreated - log new tool call
  const toolAssistantCallCreated = (toolCall: any) => {
    if (toolCall.type != 'code_interpreter') {
      return;
    }
    appendAssistantMessage('code', '');
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolAssistantCallDelta = (delta: any) => {
    if (delta.type != 'code_interpreter') {
      return;
    }
    if (!delta.code_interpreter.input) {
      return;
    }
    appendAssistantToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleAssistantRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction,
  ) => {
    try {
      setLoading(true);
      const runId = event.data.id;
      const toolCalls =
        event.data.required_action.submit_tool_outputs.tool_calls;
      // loop over tool calls and call function handler
      const toolCallOutputs = await Promise.all(
        toolCalls.map(async (toolCall: any) => {
          const result = await functionCallHandler(toolCall);
          return { output: result, tool_call_id: toolCall.id };
        }),
      );
      setAgentRunning(true);
      await submitAssistantActionResult(runId, toolCallOutputs);
      setLoading(false);
    } catch (error) {
      console.error('handleAssistantRequiresAction error', error);
    }
  };

  // handleRunCompleted - re-enable the input form
  const handleAssistantRunCompleted = () => {
    setAgentRunning(false);
    setThreadJob(null);
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */
  const appendAssistantToLastMessage = (text: string) => {
    setAgentMessages((prevMessages: any) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const latestText = lastMessage.text + text;
      const updatedLastMessage = {
        ...lastMessage,
        text: latestText,
      };

      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendAssistantMessage = (role: string, text: string) => {
    setAgentMessages((prevMessages: any) => [...prevMessages, { role, text }]);
  };

  const annotateAssistantLastMessage = (annotations: any) => {
    setAgentMessages((prevMessages: any) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation: any) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`,
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const submitAssistantActionResult = async (
    runId: string,
    toolCallOutputs: {
      output: string;
      tool_call_id: string;
    }[],
  ) => {
    const stream = getOpenAIClient().beta.threads.runs.submitToolOutputsStream(
      threadRef.current?.id,
      runId,
      // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
      { tool_outputs: toolCallOutputs },
    );

    const new_stream = AssistantStream.fromReadableStream(
      stream.toReadableStream(),
    );
    handleAssistantReadableStream(new_stream);
  };

  const handleAssistantReadableStream = (stream: AssistantStream) => {
    // messages
    // stream.on('textCreated', handleAssistantTextCreated);
    stream.on('textDelta', handleAssistantTextDelta);

    // image
    stream.on('imageFileDone', handleAssistantImageFileDone);

    // code interpreter
    stream.on('toolCallCreated', toolAssistantCallCreated);
    stream.on('toolCallDelta', toolAssistantCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on('event', (event) => {
      if (event.event === 'thread.run.created') {
        console.log('thread.run.created', event.data);
        setThreadJob(event.data);
        if (event?.data?.usage) {
          tokensRecord(event?.data?.usage);
        }
      }

      if (event.event === 'thread.run.completed') {
        setThreadJob(null);
        handleAssistantRunCompleted();
        if (event?.data?.usage) {
          tokensRecord(event?.data?.usage);
        }
      }

      if (event.event === 'thread.run.requires_action') {
        handleAssistantRequiresAction(event);
        if (event?.data?.usage) {
          tokensRecord(event?.data?.usage);
        }
      }
    });
  };

  const tokensRecord = (e: Run.Usage) => {
    setInputTokens((prev) => prev + e.prompt_tokens);
    setOutputTokens((prev) => prev + e.completion_tokens);
  };

  const sendAssistantMessage = async (text: string) => {
    if (!threadRef.current?.id) {
      console.error('Thread not found');
      return;
    }

    if (!assistantRef?.current?.id) {
      console.error('Assistant not found');
      return;
    }

    // wait to see if the thread is already running
    const waitSeconds = 3 * 1000;
    if (threadJobRef.current) {
      await new Promise((resolve) => setTimeout(resolve, waitSeconds));
      if (threadJobRef.current) {
        console.error('Thread is already running');
        return;
      }
    }

    // may need to add a check to see if the thread is already created
    try {
      handleAssistantTextCreated();
      await getOpenAIClient().beta.threads.messages.create(
        threadRef.current?.id,
        {
          role: 'user',
          content: text,
        },
      );

      const stream = getOpenAIClient().beta.threads.runs.stream(
        threadRef.current?.id,
        {
          assistant_id: assistantRef?.current?.id,
        },
      );

      const new_stream = AssistantStream.fromReadableStream(
        stream.toReadableStream(),
      );

      handleAssistantReadableStream(new_stream);
    } catch (error) {
      console.error('sendAssistantMessage error', JSON.stringify(error));
    }
  };

  const connectConversation = useCallback(async () => {
    try {
      setConnectStatus(CONNECT_CONNECTING);
      // setConnectMessage('Collecting Assistants...');
      // await cleanupAssistants();
      // setConnectMessage('Collecting Vector Stores...');
      // await cleanupVectorStores();
      setConnectMessage('Creating Assistant...');
      await setupSession();
      setConnectStatus(CONNECT_CONNECTED);
      setConnectMessage('');
    } catch (error: any) {
      setConnectStatus(CONNECT_DISCONNECTED);
      setConnectMessage(error.message);
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
            setAssistantRunning={setAgentRunning}
            sendAssistantMessage={sendAssistantMessage}
            stopCurrentStreamJob={stopCurrentStreamJob}
            assistantRunning={agentRunning}
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
