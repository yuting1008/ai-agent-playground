import { useCallback, useRef, useState } from 'react';

import {
  CONNECT_CONNECTED,
  CONNECT_CONNECTING,
  CONNECT_DISCONNECTED,
  DEEPSEEK_FUNCTION_CALL_ENABLE,
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
import { DeepSeekTokenUsage } from '../types/DeepSeek';
import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { FunctionTool } from '../types/FunctionTool';
import { enableFunctionCalling } from '../lib/helper';

export function ConsolePageDeepSeek() {
  const {
    setResponseBuffer,
    connectStatus,
    setConnectStatus,
    connectMessage,
    setConnectMessage,
    recordTokenLatency,
    isDebugModeRef,
    setInputTokens,
    setOutputTokens,
    functionsToolsRef,
  } = useContexts();

  const [messagesAssistant, setMessagesAssistant] = useState<any[]>([]);

  const [assistantRunning, setAssistantRunning] = useState(false);

  const { llmInstructionsRef } = useContexts();

  const stopCurrentStreamJob = async () => {
    setAssistantRunning(false);
  };

  // textCreated - create new assistant message
  const handleAssistantTextCreated = () => {
    appendAssistantMessage('assistant', '');
  };

  const handleAssistantTextDelta = (delta: any) => {
    recordTokenLatency(delta);

    if (isDebugModeRef.current) {
      console.log('delta', delta);
    }

    if (delta.content) {
      setResponseBuffer((latestText) => latestText + delta.content);
      appendAssistantToLastMessage(delta.content);
    }

    if (delta.annotations) {
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

    setAssistantRunning(true);
    handleAssistantTextCreated();

    // Please install OpenAI SDK first: `npm install openai`

    let stream: ReadableStream | undefined;
    let reader: ReadableStreamDefaultReader | undefined;
    try {
      let deepSeekTargetUri = localStorage.getItem('deepSeekTargetUri') || '';
      deepSeekTargetUri = deepSeekTargetUri.replace(
        '/chat/completions?api-version=2024-05-01-preview',
        '',
      );
      const deepSeekApiKey = localStorage.getItem('deepSeekApiKey') || '';
      const modelName =
        localStorage.getItem('deepSeekDeploymentName') || 'deepseek-r1';

      const client = ModelClient(
        deepSeekTargetUri,
        new AzureKeyCredential(deepSeekApiKey),
      );

      const tools: FunctionTool[] = [];
      functionsToolsRef.current.forEach(
        ([definition]: [ToolDefinitionType, Function]) => {
          tools.push({ type: 'function', function: definition });
        },
      );

      const params = {
        messages: [
          { role: 'system', content: llmInstructionsRef.current },
          {
            role: 'user',
            content: text,
          },
        ],
        model: modelName,
        stream: true,
        // max_tokens: 2048,
        tools: enableFunctionCalling() ? tools : undefined,
      };

      const response = await client
        .path('/chat/completions')
        .post({
          timeout: 100000,
          body: params,
        })
        .asNodeStream();

      stream = response.body as unknown as ReadableStream;
      if (!stream) {
        console.log('stream is null', stream);
        throw new Error('Stream is null');
      }

      if (response.status !== '200') {
        if (response.status === '429') {
          setConnectMessage('429 Too Many Requests');
          return;
        }
        setConnectMessage(JSON.stringify(response));
        throw new Error(JSON.stringify(response));
      }

      const sseStream = createSseStream(stream);
      reader = sseStream.getReader();

      while (true) {
        const { done, value: event } = await reader.read();
        if (done) break;

        if (event.data === '[DONE]') {
          break;
        }

        for (const choice of JSON.parse(event.data).choices) {
          if (choice?.delta) {
            handleAssistantTextDelta(choice?.delta);
          }
        }

        const data = JSON.parse(event.data);
        if (data?.usage) {
          tokensRecord(data?.usage);
        }
      }

      setAssistantRunning(false);
    } catch (error) {
      console.error('sendAssistantMessage error', error);
    } finally {
      setAssistantRunning(false);
    }
  };

  const tokensRecord = (e: DeepSeekTokenUsage) => {
    setInputTokens((prev) => prev + e.prompt_tokens);
    setOutputTokens((prev) => prev + e.completion_tokens);
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
