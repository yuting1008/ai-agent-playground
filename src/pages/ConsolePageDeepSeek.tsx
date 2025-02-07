import { useCallback, useState } from 'react';

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
import AssistantMessages from '../components/AssistantMessages';

import { useContexts } from '../providers/AppProvider';
import { InputBarAssistant } from '../components/InputBarAssistant';

import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import { createSseStream } from '@azure/core-sse';

export function ConsolePageDeepSeek() {
  const {
    setResponseBuffer,
    connectStatus,
    setConnectStatus,
    connectMessage,
    setConnectMessage,
    isDebugModeRef,
  } = useContexts();

  const [messagesAssistant, setMessagesAssistant] = useState<any[]>([]);

  const [assistantRunning, setAssistantRunning] = useState(false);

  const { functionsToolsRef, llmInstructions } = useContexts();

  const stopCurrentStreamJob = async () => {
    console.log('stopCurrentStreamJob');
  };

  // textCreated - create new assistant message
  const handleAssistantTextCreated = () => {
    appendAssistantMessage('assistant', '');
  };

  const handleAssistantTextDeltaDs = (delta: any) => {
    // recordTokenLatency(delta);

    if (isDebugModeRef.current) {
      console.log('delta', delta);
    }

    if (delta.content != null) {
      setResponseBuffer((latestText) => latestText + delta.content);
      appendAssistantToLastMessage(delta.content);
    }

    if (delta.annotations != null) {
      annotateAssistantLastMessage(delta.annotations);
    }
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */
  const appendAssistantToLastMessage = (text: string) => {
    setMessagesAssistant((prevMessages: any) => {
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
    setMessagesAssistant((prevMessages: any) => [
      ...prevMessages,
      { role, text },
    ]);
  };

  const annotateAssistantLastMessage = (annotations: any) => {
    setMessagesAssistant((prevMessages: any) => {
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

  const sendAssistantMessage = async (text: string) => {
    if (text.length === 0) {
      return;
    }

    let deepSeekTargetUri = localStorage.getItem('deepSeekTargetUri') || '';
    deepSeekTargetUri = deepSeekTargetUri.replace(
      '/chat/completions?api-version=2024-05-01-preview',
      '',
    );
    const deepSeekApiKey = localStorage.getItem('deepSeekApiKey') || '';
    const modelName =
      localStorage.getItem('deepSeekDeploymentName') || 'deepseek-r1';

    try {
      const client = ModelClient(
        deepSeekTargetUri,
        new AzureKeyCredential(deepSeekApiKey),
      );

      const response = await client
        .path('/chat/completions')
        .post({
          timeout: 10000,
          body: {
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              {
                role: 'user',
                content: text,
              },
            ],
            max_tokens: 2048,
            model: modelName,
            stream: true,
          },
        })
        .asNodeStream();

      const stream = response.body as unknown as ReadableStream;
      if (!stream) {
        console.log('stream', stream);
        throw new Error(stream);
      }

      if (response.status !== '200') {
        stream.cancel();
        if (response.status === '429') {
          setConnectMessage('429 Too Many Requests');
          return;
        }
        setConnectMessage(JSON.stringify(response));
        throw new Error(JSON.stringify(response));
      }

      handleAssistantTextCreated();
      setAssistantRunning(true);

      const sseStream = createSseStream(stream);

      console.log('sseStream', sseStream);

      for await (const event of sseStream) {
        if (event.data === '[DONE]') {
          return;
        }
        for (const choice of JSON.parse(event.data).choices) {
          if (choice?.delta) {
            console.log('delta', choice?.delta);
            handleAssistantTextDeltaDs(choice?.delta);
          }
        }
      }
      setAssistantRunning(false);
    } catch (error) {
      setAssistantRunning(false);
      console.error('sendAssistantMessage error', error);
    }
  };

  const connectConversation = useCallback(async () => {
    const deepSeekTargetUri = localStorage.getItem('deepSeekTargetUri') || '';
    const deepSeekApiKey = localStorage.getItem('deepSeekApiKey') || '';
    if (!deepSeekTargetUri || !deepSeekApiKey) {
      setConnectStatus(CONNECT_DISCONNECTED);
      setConnectMessage('Please set the DeepSeek Target URI and key');
      return;
    }

    setConnectStatus(CONNECT_CONNECTING);
    setConnectMessage('Connecting to DeepSeek...');
    setConnectStatus(CONNECT_CONNECTED);
    setConnectMessage('');
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

            <AssistantMessages
              connectStatus={connectStatus}
              messagesAssistant={messagesAssistant}
            />
          </div>

          <InputBarAssistant
            setMessagesAssistant={setMessagesAssistant}
            setAssistantRunning={setAssistantRunning}
            sendAssistantMessage={sendAssistantMessage}
            stopCurrentStreamJob={stopCurrentStreamJob}
            assistantRunning={assistantRunning}
          />
        </div>
      </div>

      <div className="content-right">
        <Avatar />

        <SettingsComponent connectStatus={connectStatus} />

        <ConnectButton
          connectStatus={connectStatus}
          connectConversation={connectConversation}
        />
      </div>
    </>
  );
}
