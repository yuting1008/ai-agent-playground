import { useCallback, useState } from 'react';

import {
  APP_AGENT,
  APP_AGENT_VECTOR_STORE,
  CONNECT_CONNECTED,
  CONNECT_CONNECTING,
} from '../lib/const';

import './ConsolePage.scss';
import Camera from '../components/Camera';
import SettingsComponent from '../components/Settings';
import FileViewer from '../components/FileViewer';
import Avatar from '../components/Avatar';
import ConnectButton from '../components/ConnectButton';
import ConnectMessage from '../components/ConnectMessage';
import AssistantMessages from '../components/AssistantMessages';

import { getOpenAIClient, parseOpenaiSetting } from '../lib/openai';
import { AssistantStream } from 'openai/lib/AssistantStream';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import {
  Assistant,
  AssistantCreateParams,
  AssistantListParams,
  AssistantsPage,
} from 'openai/resources/beta/assistants';
import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';
import { InputBarAssistant } from '../components/InputBarAssistant';
import {
  VectorStore,
  VectorStoresPage,
} from 'openai/resources/beta/vector-stores/vector-stores';

export function ConsolePageAssistant() {
  const {
    assistantRef,
    setAssistant,
    vectorStore,
    vectorStoreRef,
    setVectorStore,
    setLoading,
    threadRef,
    threadJobRef,
    setThreadJob,
    setThread,
    setResponseBuffer,
    recordTokenLatency,
    connectStatus,
    setConnectStatus,
    connectMessage,
    setConnectMessage,
    isDebugModeRef,
  } = useContexts();

  const [messagesAssistant, setMessagesAssistant] = useState<any[]>([]);

  const [assistantRunning, setAssistantRunning] = useState(false);

  const { functionsToolsRef, llmInstructions } = useContexts();

  const cleanupAssistants = async () => {
    try {
      const assistantsPageList: Assistant[] = [];
      let lists: AssistantsPage =
        await getOpenAIClient().beta.assistants.list();
      assistantsPageList.push(...lists.data);
      setConnectMessage(
        `Collecting Assistants(${assistantsPageList.length})...`,
      );

      while (lists.hasNextPage()) {
        lists = await lists.getNextPage();
        assistantsPageList.push(...lists.data);
        setConnectMessage(
          `Collecting Assistants(${assistantsPageList.length})...`,
        );
      }

      for (const [index, assistant] of assistantsPageList.entries()) {
        if (assistant.name === APP_AGENT) {
          setConnectMessage(
            `Deleting Assistant(${index}/${assistantsPageList.length}): ${assistant.id}`,
          );
          await getOpenAIClient().beta.assistants.del(assistant.id);
        }
      }
    } catch (error: any) {
      console.error(`Error listing assistants: ${error.message}`);
      alert(`Error listing assistants: ${error.message}`);
    }
  };

  const cleanupVectorStores = async () => {
    try {
      const bectorStoresPages: VectorStore[] = [];
      let lists: VectorStoresPage =
        await getOpenAIClient().beta.vectorStores.list();

      bectorStoresPages.push(...lists.data);
      setConnectMessage(
        `Collecting Vector Stores(${bectorStoresPages.length})...`,
      );

      while (lists.hasNextPage()) {
        lists = await lists.getNextPage();
        bectorStoresPages.push(...lists.data);
        setConnectMessage(
          `Collecting Vector Stores(${bectorStoresPages.length})...`,
        );
      }

      for (const [index, vectorStore] of bectorStoresPages.entries()) {
        if (vectorStore.name === APP_AGENT_VECTOR_STORE) {
          setConnectMessage(
            `Deleting Vector Store(${index}/${bectorStoresPages.length}): ${vectorStore.id}`,
          );
          await getOpenAIClient().beta.vectorStores.del(vectorStore.id);
        }
      }
    } catch (error: any) {
      console.error(`Error listing assistants: ${error.message}`);
      alert(`Error listing assistants: ${error.message}`);
    }
  };

  const setupVectorStore = async (assistantId: string) => {
    const vectorStore = await getOpenAIClient().beta.vectorStores.create({
      name: APP_AGENT_VECTOR_STORE,
    });
    await getOpenAIClient().beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });
    setVectorStore(vectorStore);
  };

  const setupAssistant = async () => {
    try {
      const { modelName } = parseOpenaiSetting(
        localStorage.getItem('completionTargetUri') || '',
      );

      const params: AssistantCreateParams = {
        instructions: llmInstructions,
        name: APP_AGENT,
        temperature: 1,
        top_p: 1,
        model: modelName,
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
      setConnectMessage(`Creating Vector Store...`);
      setupVectorStore(assistant.id);
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
      console.log('cancelJob error', JSON.stringify(error));
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
      setAssistantRunning(true);
      await submitAssistantActionResult(runId, toolCallOutputs);
      setLoading(false);
    } catch (error) {
      console.error('handleAssistantRequiresAction error', error);
    }
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
    if (!threadRef.current?.id) {
      console.error('Thread not found');
      return;
    }

    if (!assistantRef?.current?.id) {
      console.error('Assistant not found');
      return;
    }

    // wait 1.5 seconds to see if the thread is already running
    if (threadJobRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (threadJobRef.current) {
        console.error('Thread is already running');
        return;
      }
    }

    // may need to add a check to see if the thread is already created
    // Can't add messages to thread_xxx while a run run_xxx is active.
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
  };

  const connectConversation = useCallback(async () => {
    setConnectStatus(CONNECT_CONNECTING);
    setConnectMessage('Collecting Assistants...');
    await cleanupAssistants();
    setConnectMessage('Collecting Vector Stores...');
    await cleanupVectorStores();
    setConnectMessage('Creating Assistant...');
    await setupAssistant();
    setConnectMessage('Creating Thread...');
    await createThread();
    setConnectStatus(CONNECT_CONNECTED);
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
        />
      </div>
    </>
  );
}
