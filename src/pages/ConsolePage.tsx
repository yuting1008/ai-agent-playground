import { useCallback, useEffect, useRef } from 'react';

import { ItemType, ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client.js';
import { WavRecorder } from '../lib/wavtools';
import { clientHiChinese, clientHiEnglish, notDisplay, products } from '../lib/const';

import { Mic, X, Zap } from 'react-feather';
import { Button } from '../components/button/Button';
import { Toggle } from '../components/toggle/Toggle';
import './ConsolePage.scss';
import ReactMarkdown from 'react-markdown';
import Markdown from 'react-markdown';
import Camera from '../components/Camera';

import SettingsComponent from '../components/Settings';
import FileUploadComponent from '../components/FileUploadComponent';
import ProductList from '../components/ProductList';
import FileViewer from '../components/FileViewer';
import { useContexts } from '../providers/AppProvider';
import { useSettings } from '../providers/SettingsProvider';
import { useAssistant } from '../providers/AssistantProvider';
import { NightMode } from '../components/NightMode';
import Avatar from '../components/Avatar';
import { useAvatar } from '../providers/AvatarProvider';
import { useRealtime } from '../providers/RealtimeProvider';
import { InputBar } from '../components/InputBar';
import AudioVisualization from '../components/AudioVisualization';
import SingleExecutionComponent from '../components/SingleExecution';



type AssistantMessageProps = {
  role: 'user' | 'assistant' | 'code';
  text: string;
};

const AssistantUserMessage = ({ text }: { text: string }) => {
  return <div className={'conversation-item user'}>
    <div className={`speaker user`}></div>
    <div className={`speaker-content user`}>
      {text}
    </div>
  </div>;
};

const AssistantAssistantMessage = ({ text }: { text: string }) => {
  return <div className={'conversation-item assistant'}>
    <div className={`speaker assistant`}></div>
    <div className={`speaker-content assistant`}>
      <Markdown>{text}</Markdown>
    </div>
  </div>;
};

const AssistantCodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        {text.split('\n').map((line, index) => (
          <div key={index}>
            <span>{`${index + 1}. `}</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const AssistantMessage = ({ role, text }: AssistantMessageProps) => {
  switch (role) {
    case 'user':
      return <AssistantUserMessage text={text} />;
    case 'assistant':
      return <AssistantAssistantMessage text={text} />;
    case 'code':
      return <AssistantCodeMessage text={text} />;
    default:
      return null;
  }
};

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

export function ConsolePage() {

  const {
    isConnecting, setIsConnecting,
    connectMessage, setConnectMessage,
    deleteConversationItem,
    changeTurnEndType,
    isRecording,
    canPushToTalk,
    isConnected, setIsConnected,
    wavRecorderRef,
    wavStreamPlayerRef,
    startRecording,
    items, setItems, setRealtimeEvents,
    stopRecording } = useRealtime();

  const {
    isAvatarStarted, isAvatarStartedRef,
    realtimeInstructions,
    setAssistantResponseBuffer,
    functionsToolsRef,
    realtimeClientRef } = useContexts();

  const {
    isAssistant,
    isRealtime,
    endpoint,
    key,
    language,
  } = useSettings();

  const { setupAssistant, createThread, messagesAssistant } = useAssistant();
  const { stopAvatarSpeaking } = useAvatar();

  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * Connect to conversation:
   * WavRecorder tasK speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {

    if (isAssistant) {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectMessage('Creating Assistant...');
      await setupAssistant();
      setIsConnecting(false);
      setConnectMessage('Creating Thread...');
      await createThread();
      setIsConnected(true);

      // start avatar
      // if (localStorage.getItem('cogSvcSubKey') && localStorage.getItem('cogSvcRegion')  ) {
      //   await startAvatarSession();
      // }

      // setInputValue('Hello, how are you?');
      // await delayFunction(2000);
      // await sendText('Hello, how are you?');
      return;
    }

    if (!endpoint) {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage('Please set your Target URI.');
      return;
    }

    if (!key) {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage('Please set your Key.');
      return;
    }

    setIsConnecting(true);

    // Connect to realtime API
    try {
      await realtimeClientRef.current.connect();
    } catch (e: any) {
      console.error(e);
      const tip = `链接失败，如果您确定配置信息无误，可能是由于网络问题。
      \n建议使用 VPN 及最新版 Edge 浏览器。
      \nConnection failed, if you are certain that the configuration is correct, it may be due to network issues.
      \nRecommended: VPN and the latest Edge browser.
      `;
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage(tip);
      alert(`${tip}\n${e}\n\nKey is "${key}"`);
      window.location.href = '/';
      return;
    }

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setIsConnecting(false);
    setRealtimeEvents([]);
    setItems(realtimeClientRef.current.conversation.getItems());

    // Connect to microphone
    await wavRecorderRef.current.begin();

    // Connect to audio output
    await wavStreamPlayerRef.current.connect();

    realtimeClientRef.current.sendUserMessageContent([
      {
        type: `input_text`,
        text: language === 'chinese' ? clientHiChinese : clientHiEnglish
      }
    ]);

    if (realtimeClientRef.current.getTurnDetectionType() === 'server_vad') {
      await wavRecorderRef.current.record((data) => realtimeClientRef.current.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    window.location.reload();
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = realtimeClientRef.current;

    // Set instructions
    client.updateSession({ instructions: realtimeInstructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });
    // Set voice
    client.updateSession({ voice: 'echo' });

    // Add tools
    functionsToolsRef.current.forEach(([definition, handler]: [ToolDefinitionType, Function]) => {
      client.addTool(definition, handler);
    });

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });

    client.on('error', (event: any) => {
      console.error(event);
      setIsConnected(false);
      setIsConnecting(false);
    });

    client.on('close', (event: any) => {
      console.error(event);
      setIsConnected(false);
      setIsConnecting(false);
    });

    client.on('conversation.interrupted', async () => {
      await stopAvatarSpeaking();
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });

    client.on('conversation.updated', async ({ item, delta }: any) => {

      if (item.object === 'realtime.item' && item.type === 'message' && item.role === 'assistant' && isAvatarStartedRef.current) {
        setAssistantResponseBuffer(item.formatted.transcript);
      }

      const items = client.conversation.getItems();
      if (delta?.audio) {
        if (!isAvatarStartedRef.current) {
          wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        }
      }

      if (item.status === 'completed' && item.formatted.audio?.length) {
        item.formatted.file = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
      }

      const dataStore: { [key: string]: number } = {};
      // for item in items, get item and index
      for (const [index, item] of items.entries()) {

        if (item.type === 'function_call' && item?.formatted?.tool?.call_id) {
          dataStore[item.formatted.tool.call_id] = index;
          continue;
        }

        if (item.type === 'function_call_output') {
          const callId = item.call_id;
          const callIndex = dataStore[callId];
          if (callIndex !== undefined) {
            items[callIndex] = item;
            delete items[index];
          }
        }

      }

      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);


  const isHiddenTool = (item: ItemType) => {
    if (item?.formatted?.text && notDisplay.includes(item?.formatted?.text)) {
      return true;
    }

    if (item.type !== 'function_call_output') {
      return false;
    }

    // graphrag
    if (JSON.parse(item?.output)?.sources?.length > 0) {
      return false;
    }

    // painting
    if (JSON.parse(item?.output)?.result?.data?.length > 0) {
      return false;
    }

    // products
    if (JSON.parse(item?.output)?.products?.length > 0) {
      return false;
    }

    // rag
    if (JSON.parse(item?.output)?.isRag == true) {
      return false;
    }

    return true;
  };


  // automatically scroll to bottom of chat
  const messagesEndAssistantRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollToBottom = () => {
    messagesEndAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    assistantScrollToBottom();
  }, [messagesAssistant]);

  /**
   * Render the application
   */
  return (
    <div data-component="ConsolePage">

      <SingleExecutionComponent />

      <div className="content-top">
        <div className="content-title"><img src="/logomark.svg" alt="logo" /><h1>AI Agent Playground</h1></div>
        <span className="copyright">PRC STU Azure Team</span>
        <NightMode />
      </div>

      <div className="content-main">

        <div className="content-logs container_bg">
          <div className="content-block conversation">

            <div className="content-block-body" data-conversation-content>

              {isConnecting && (
                <div className={'waiting'}>
                  Connection...
                </div>
              )}

              {!isConnecting && !isConnected && (
                <div className={'waiting'}>
                  {connectMessage}
                </div>
              )}

              {/* assistant chat */}
              {isConnected && isAssistant &&
                <div>
                  {messagesAssistant.map((msg, index) => (
                    <AssistantMessage key={index} role={msg.role} text={msg.text} />
                  ))}
                  <div ref={messagesEndAssistantRef} />
                </div>
              }

              {/* realtime chat */}
              {items.map((conversationItem) => {

                if (isHiddenTool(conversationItem)) {
                  return null;
                }

                return (
                  <div className={`conversation-item ${conversationItem.role === 'user' ? 'user' : 'assistant'}`}
                    key={conversationItem.id}>

                    <div className={`speaker ${conversationItem.role === 'user' ? 'user' : 'assistant'}`}>
                    </div>

                    <div className={`speaker-content ${conversationItem.role === 'user' ? 'user' : 'assistant'}`}>


                      <div
                        className="close"
                        onClick={() =>
                          deleteConversationItem(conversationItem.id)
                        }
                      >
                        <X />
                      </div>


                      {/* tool call */}
                      {!!conversationItem.formatted.tool && (
                        <div className="loading-spinner" key={conversationItem.id}>
                          <div className="spinner" key={conversationItem.id + 'spinner'}></div>
                        </div>
                      )}

                      {/* tool response */}
                      {conversationItem.type === 'function_call_output' && (
                        <div>

                          {JSON.parse(conversationItem?.output)?.result?.data.map((item: any) => {
                            if (item.url) {
                              return <img src={item.url}
                                key={conversationItem.id + item.url}
                                alt={item.url}
                                className="painting_img" />;
                            }
                            return null;
                          })}

                          {JSON.parse(conversationItem?.output)?.sources?.map((item: any) => {
                            if (item.screenshot_sas_url && item.screenshot_sas_url.length > 1) {
                              return <div>

                                {/* <ReactMarkdown
                                  components={{
                                    a: ({ node, ...props }) => (
                                      <a {...props} target="_blank" rel="noopener noreferrer">
                                        {props.children}
                                      </a>
                                    )
                                  }}
                                >
                                  {JSON.parse(conversationItem?.output)?.response}
                                </ReactMarkdown> */}

                                <div className="icon_file_link">
                                  <img src="/pdf.svg" alt="file" /><a href={item.pdf_sas_url}
                                    target="_blank">{item.pdf_file}</a> Page:{item.page_number}
                                </div>

                                <a href={item.screenshot_sas_url} target="_blank">
                                  <img src={item.screenshot_sas_url}
                                    key={conversationItem.id + item.screenshot_file}
                                    alt={item.screenshot_sas_url}
                                    className="graphrag_img" />
                                </a>
                              </div>;
                            }
                            return null;
                          })}

                          {JSON.parse(conversationItem?.output)?.products && <ProductList products={products} />}

                        </div>
                      )}

                      {/*user message*/}
                      {!conversationItem.formatted.tool &&
                        conversationItem.role === 'user' && (
                          <div>

                            {conversationItem.formatted.transcript ||
                              (conversationItem.formatted.audio?.length
                                ? '(awaiting transcript)'
                                : conversationItem.formatted.text ||
                                '(item sent)')}

                          </div>
                        )}

                      {/*assistant message*/}
                      {!conversationItem.formatted.tool &&
                        conversationItem.role === 'assistant' && (
                          <div>
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => (
                                  <a {...props} target="_blank" rel="noopener noreferrer">
                                    {props.children}
                                  </a>
                                )
                              }}
                            >
                              {conversationItem.formatted.transcript ||
                                conversationItem.formatted.text ||
                                '(truncated)'}
                            </ReactMarkdown>
                          </div>
                        )}

                      {/*file message*/}
                      {conversationItem.formatted.file && (conversationItem.role === 'user' || !isAvatarStarted) && (
                        <audio
                          src={conversationItem.formatted.file.url}
                          controls
                        />
                      )}

                    </div>
                  </div>
                );
              })}

            </div>

            <InputBar />

          </div>
        </div>

        <div className="content-right">

          <Avatar />

          <Camera />

          {!isConnected && <SettingsComponent />}

          {isConnected && isRealtime && (
            <div className="content-actions container_bg">
              <Toggle
                defaultValue={false}
                labels={['Manual', 'VAD']}
                values={['none', 'server_vad']}
                onChange={(_, value) => changeTurnEndType(value)}
              />
            </div>
          )
          }

          {isConnected && isRealtime && canPushToTalk && (
            <div className="content-actions">
              <Button
                label={isRecording ? 'Release to send' : 'Push to talk'}
                icon={Mic}
                className={'container_bg'}
                buttonStyle={isRecording ? 'alert' : 'regular'}
                style={isRecording ? { backgroundColor: '#80cc29', color: '#ffffff' } : {}}
                disabled={!isConnected || !canPushToTalk}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
              />
            </div>
          )}

          {isConnected && isRealtime && (<FileUploadComponent />)}

          {isConnected && isAssistant && (<FileViewer />)}

          <div className="content-actions">
            <Button
              disabled={isConnecting}
              className={'container_bg'}
              label={isConnected ? 'Disconnect' : (isConnecting ? 'Connecting' : 'Connect')}
              icon={isConnected ? X : Zap}
              buttonStyle={isConnected ? 'regular' : 'action'}
              onClick={
                isConnected ? disconnectConversation : connectConversation
              }
            />
          </div>

          <AudioVisualization />

        </div>

      </div>
    </div>
  );
}
