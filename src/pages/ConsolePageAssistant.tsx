import { useCallback, useState } from 'react';

import {
  CONNECT_CONNECTED,
  CONNECT_CONNECTING,
  CONNECT_DISCONNECTED,
} from '../lib/const';

import './ConsolePage.scss';
import Camera from '../components/Camera';
import SettingsComponent from '../components/Settings';
import FileViewer from '../components/FileViewer';
import Avatar from '../components/Avatar';
import ConnectButton from '../components/ConnectButton';
import ConnectMessage from '../components/ConnectMessage';
import AssistantMessages from '../components/AssistantMessages';

import { getOpenAIClient } from '../lib/openai';
import { AssistantStream } from 'openai/lib/AssistantStream';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import {
  Assistant,
  AssistantCreateParams,
} from 'openai/resources/beta/assistants';
import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';
import { InputBarAssistant } from '../components/InputBarAssistant';

export function ConsolePageAssistant() {
  const { connectStatus, setConnectStatus } = useContexts();
  const {
    assistantRef,
    setAssistant,
    setLoading,
    threadRef,
    threadJobRef,
    setThreadJob,
    setThread,
    setResponseBuffer,
    recordTokenLatency,
  } = useContexts();

  const [connectMessage, setConnectMessage] = useState(
    'Awaiting Connection...',
  );

  const [messagesAssistant, setMessagesAssistant] = useState<any[]>([]);

  const [assistantRunning, setAssistantRunning] = useState(false);

  const { functionsToolsRef, llmInstructions } = useContexts();

  const setupAssistant = async () => {
    try {
      // const assistantId = localStorage.getItem('assistantId') || '';
      // if (assistantId) {
      //   console.log(`Assistant already exists: ${assistantId}`);
      //   return;
      // }

      const params: AssistantCreateParams = {
        instructions: llmInstructions,
        name: 'Quickstart Assistant',
        temperature: 1,
        top_p: 1,
        model: 'gpt-4o-mini',
        tools: [{ type: 'code_interpreter' }, { type: 'file_search' }],
      };

      functionsToolsRef.current.forEach(
        ([definition]: [ToolDefinitionType, Function]) => {
          params.tools?.push({ type: 'function', function: definition });
        },
      );

      const assistant: Assistant =
        await getOpenAIClient().beta.assistants.create(params);
      console.log(`Assistant created:`, assistant);
      setAssistant(assistant);
    } catch (error: any) {
      console.error(`Error creating assistant: ${error.message}`);
      alert(`Error creating assistant: ${error.message}`);
    }
  };

  const functionCallHandler = async (call: any) => {
    console.log('function call', call);
    const args = JSON.parse(call.function.arguments);

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
    if (!threadJobRef.current) return;

    console.log('stopCurrentStreamJob:', threadJobRef.current);

    try {
      const cancelJob = await getOpenAIClient().beta.threads.runs.cancel(
        threadRef.current?.id,
        threadJobRef.current?.id,
      );
      console.log('cancelJob', cancelJob);
    } catch (error) {
      console.log('cancelJob error', error);
    }

    setThreadJob(null);
  };

  const createThread = async () => {
    const thread = await getOpenAIClient().beta.threads.create();
    console.log('thread', thread);
    setThread(thread);
  };

  // textCreated - create new assistant message
  const handleAssistantTextCreated = () => {
    appendAssistantMessage('assistant', '');
  };

  // textDelta - append text to last assistant message
  const handleAssistantTextDelta = (delta: any) => {
    recordTokenLatency(delta);

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
    if (toolCall.type != 'code_interpreter') return;
    appendAssistantMessage('code', '');
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolAssistantCallDelta = (delta: any) => {
    if (delta.type != 'code_interpreter') return;
    if (!delta.code_interpreter.input) return;
    appendAssistantToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleAssistantRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction,
  ) => {
    setLoading(true);
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall: any) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      }),
    );
    setAssistantRunning(true);
    await submitAssistantActionResult(runId, toolCallOutputs);
    setLoading(false);
  };

  // handleRunCompleted - re-enable the input form
  const handleAssistantRunCompleted = () => {
    setAssistantRunning(false);
    setThreadJob(null);
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
    stream.on('textCreated', handleAssistantTextCreated);
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
      }

      if (event.event === 'thread.run.completed') {
        setThreadJob(null);
      }

      if (event.event === 'thread.run.requires_action') {
        handleAssistantRequiresAction(event);
      }

      if (event.event === 'thread.run.completed') {
        handleAssistantRunCompleted();
      }
    });
  };

  const sendAssistantMessage = async (text: string) => {
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
        assistant_id: assistantRef?.current?.id || '',
      },
    );

    const new_stream = AssistantStream.fromReadableStream(
      stream.toReadableStream(),
    );

    handleAssistantReadableStream(new_stream);
  };

  const connectConversation = useCallback(async () => {
    setConnectStatus(CONNECT_CONNECTING);
    setConnectMessage('Creating Assistant...');
    await setupAssistant();
    setConnectMessage('Creating Thread...');
    await createThread();
    setConnectStatus(CONNECT_CONNECTED);
  }, []);

  const disconnectConversation = () => {
    setConnectStatus(CONNECT_DISCONNECTED);
    stopCurrentStreamJob();
    setMessagesAssistant([]);
    setResponseBuffer('');
    setThreadJob(null);
    setThread(null);
    setAssistant(null);
  };

  /**
   * Render the application
   */
  return (
    <>
      <div className="content-logs container_bg">
        <div className="content-block conversation">
          <div className="content-block-body" data-conversation-content>
            <ConnectMessage
              connectStatus={connectStatus}
              connectMessage={connectMessage}
            />

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

        <FileViewer connectStatus={connectStatus} />

        <ConnectButton
          connectStatus={connectStatus}
          connectConversation={connectConversation}
          disconnectConversation={disconnectConversation}
        />
      </div>
    </>
  );
}
