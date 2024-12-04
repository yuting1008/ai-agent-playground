import { useCallback, useEffect, useRef, useState } from 'react';

import { ItemType } from '@theodoreniu/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from './lib/wavtools';
import { clientHiChinese, clientHiEnglish, notDisplay, products } from './lib/const';
import { WavRenderer } from './lib/wav_renderer';

import { Mic, MicOff, Send, X, Zap, StopCircle, Clock } from 'react-feather';
import { Button } from './components/button/Button';
import { Toggle } from './components/toggle/Toggle';
import './ConsolePage.scss';
import ReactMarkdown from 'react-markdown';
import Markdown from 'react-markdown';
import CameraComponent from './components/CameraComponent';


import * as memory from './tools/memory';
import * as order_get from './tools/order_get';
import * as order_return from './tools/order_return';
import * as avatar from './tools/avatar';
import * as dark from './tools/dark';
import * as weather from './tools/weather';
import * as news from './tools/news';
import * as location from './tools/location';
import * as stock_recommend from './tools/stock_recommend';
import * as products_recommend from './tools/products_recommend';
import * as demo from './tools/demo';
import * as feishu from './tools/feishu';
import * as pronunciation_assessment from './tools/pronunciation_assessment';
import * as quote from './tools/quote';
import * as exchange_rate_aim from './tools/exchange_rate_aim';
import * as exchange_rate_list from './tools/exchange_rate_list';
import * as azure_docs from './tools/azure_docs';
import * as exchange_rate_configs from './tools/exchange_rate_configs';
import Painting from './components/Painting';
import SettingsComponent from './components/Settings';
import FileUploadComponent from './components/FileUploadComponent';
import ProductList from './components/ProductList';
import LocalStorageViewer from './components/LocalStorageViewer';
import FileViewer from './components/FileViewer';
import { useContexts } from './providers/AppProvider';
import Loading from './components/Loading';
import { useSettings } from './providers/SettingsProvider';
import { useAssistant } from './providers/AssistantProvider';
import { NightMode } from './components/NightMode';
import Avatar from './components/Avatar';
import { useAvatar } from './providers/AvatarProvider';
import { useStt } from './providers/SttProvider';
import { useRealtime } from './providers/RealtimeProvider';


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

  const { wavRecorderRef, wavStreamPlayerRef } = useRealtime();
  const { isConnected, isConnectedRef, setIsConnected } = useRealtime();
  const { setIsConnecting } = useRealtime();
  const { cancleRealtimeResponse, isConnectingRef, connectMessageRef, setConnectMessage, deleteConversationItem, changeTurnEndType, isRecordingRef, canPushToTalkRef, startRecording, stopRecording } = useRealtime();



  const {



    isAvatarStartedRef,

    realtimeInstructionsRef,

    realtimeClientRef,
    inputValueRef } = useContexts();

  const {
    isAssistant,
    isRealtime,
    endpointRef,
    keyRef,
    languageRef,
  } = useSettings();

  const {
    setupAssistant,
    stopCurrentStreamJob,
    createThread } = useAssistant();

  const { speakAvatar, processAndStoreSentence, stopAvatarSpeaking } = useAvatar();


  // ----------------- avatar speech -----------------



  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscaling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);



  // if connected is false, clear all items
  useEffect(() => {
    if (isConnectedRef.current == false) {
      setItems([]);
    }
  }, [isConnected]);

  /**
   * Connect to conversation:
   * WavRecorder tasK speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {


    if (isAssistant) {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectMessage('Creating Assistant...');
      setupAssistant();
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



    if (!endpointRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage('Please set your Target URI.');
      return;
    }

    if (!keyRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage('Please set your Key.');
      return;
    }

    setIsConnecting(true);
    const client = realtimeClientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Connect to realtime API
    try {
      await client.connect();
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
      alert(`${tip}\n${e}\n\nKey is "${keyRef.current}"`);
      window.location.href = '/';
      return;
    }


    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setIsConnecting(false);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();


    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: languageRef.current === 'chinese' ? clientHiChinese : clientHiEnglish
      }
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {

    window.location.href = '/';

    // stopAvatarSession();
    // setIsConnected(false);
    // setIsConnecting(false);
    // setRealtimeEvents([]);
    // setItems([]);


    // setMarker(null);

    // const client = clientRef.current;
    // client.disconnect();

    // const wavRecorder = wavRecorderRef.current;
    // await wavRecorder.end();

    // const wavStreamPlayer = wavStreamPlayerRef.current;
    // await wavStreamPlayer.interrupt();


  }, []);





  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#80cc29',
              20,
              0,
              8
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#ffffff',
              20,
              0,
              8
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Whether to use the avatar
   */
  function shouldUseRealTimeAudio() {
    return !isAvatarStartedRef.current;
  }


  const order_get_tool: Function = async () => async () => {
    return {
      orders: [
        { id: 11, name: 'Order 11', status: 'pending', created_at: '2024-01-01 12:00:00' },
        { id: 22, name: 'Order 22', status: 'completed', created_at: '2024-01-01 12:00:00' }
      ]
    };
  };

  const order_return_tool: Function = async ({ order_id }: { [order_id: string]: string }) => {
    return {
      message: `return of goods for order ${order_id} is completed`
    };
  };






  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = realtimeClientRef.current;

    // Set instructions
    client.updateSession({ instructions: realtimeInstructionsRef.current });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });
    // Set voice
    client.updateSession({ voice: 'echo' });

    // Add tools
    client.addTool(memory.definition, memory.handler);
    client.addTool(weather.definition, weather.handler);
    client.addTool(avatar.definition, avatar.handler);
    client.addTool(order_get.definition, order_get_tool);
    client.addTool(order_return.definition, order_return_tool);
    client.addTool(dark.definition, dark.handler);
    client.addTool(news.definition, news.handler);
    client.addTool(exchange_rate_aim.definition, exchange_rate_aim.handler);
    client.addTool(exchange_rate_list.definition, exchange_rate_list.handler);
    client.addTool(exchange_rate_configs.definition, exchange_rate_configs.handler);
    client.addTool(products_recommend.definition, products_recommend.handler);
    client.addTool(location.definition, location.handler);
    client.addTool(feishu.definition, feishu.handler);
    client.addTool(pronunciation_assessment.definition, pronunciation_assessment.handler);
    client.addTool(azure_docs.definition, azure_docs.handler);
    client.addTool(demo.definition, demo.handler);
    client.addTool(quote.definition, quote.handler);
    client.addTool(stock_recommend.definition, stock_recommend.handler);
    // client.addTool(microsoftgraph.definition, microsoftgraph.handler);

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

      if (item.object === 'realtime.item' && item.type === 'message' && item.role === 'assistant' && !shouldUseRealTimeAudio()) {
        const sentences = processAndStoreSentence(item.id, item.formatted.transcript);
        for (const sentence of sentences) {
          if (sentence.exists === false) {
            console.log(`Speech Need: ${sentence.sentence}`);
            speakAvatar(sentence.sentence);
          }
        }
      }

      const items = client.conversation.getItems();
      if (delta?.audio) {
        if (shouldUseRealTimeAudio()) {
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

  const { sttRecognizerRef, sttRecognizerConnectingRef, sttStartRecognition, sttStopRecognition } = useStt();

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


  const { messagesAssistant, assistantRunning, setAssistantRunning } = useAssistant();
  // automatically scroll to bottom of chat
  const messagesEndAssistantRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollToBottom = () => {
    messagesEndAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    assistantScrollToBottom();
  }, [messagesAssistant]);



  const { setInputValue } = useContexts();

  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    stopAvatarSpeaking();
    cancleRealtimeResponse();
    realtimeClientRef.current.sendUserMessageContent([
      {
        type: `input_text`,
        text: inputValue
      }
    ]);
    setInputValue('');
    console.log('send text', inputValue);
  };


  /**
   * Render the application
   */
  return (
    <div data-component="ConsolePage">

      <Loading />

      <Painting client={realtimeClientRef.current} wavStreamPlayer={wavStreamPlayerRef.current} />

      <div className="content-top">

        <div className="content-title">
          <img src="/logomark.svg" alt="logo" />
          <h1>AI Agent Playground</h1>
        </div>

        <span className="copyright">
          PRC STU Azure Team
        </span>

        <NightMode />

        <LocalStorageViewer />

      </div>
      <div className="content-main">

        <div className="content-logs container_bg">


          <div className="content-block conversation">

            <div className="content-block-body" data-conversation-content>

              {isConnectingRef.current && (
                <div className={'waiting'}>
                  Connection...
                </div>
              )}

              {!isConnectingRef.current && !isConnectedRef.current && (
                <div className={'waiting'}>
                  {connectMessageRef.current}
                </div>
              )}

              {/* assistant chat */}
              {isConnectedRef.current && isAssistant &&
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
                      {conversationItem.formatted.file && (conversationItem.role === 'user' || !isAvatarStartedRef.current) && (
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

            {/* text input */}
            {
              isConnected && (

                <div className="text-input">
                  <input type="text"
                    placeholder="Type your message here..."
                    value={inputValueRef.current}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendText(inputValueRef.current);
                      }
                      if (e.key === 'Escape') {
                        setInputValue('');
                      }
                    }} onChange={(e) => setInputValue(e.target.value)} />

                  <button onClick={() => sendText(inputValueRef.current)}
                    style={{ display: inputValueRef.current ? '' : 'none' }}
                    disabled={!inputValueRef.current}><Send /></button>


                  <button
                    onClick={
                      () => {
                        setAssistantRunning(false);
                        (async () => {
                          await stopCurrentStreamJob();
                        })();
                      }
                    }
                    style={{
                      padding: '5px 5px',
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      display: assistantRunning ? '' : 'none'
                    }}
                  >
                    <StopCircle />
                  </button>

                  <button
                    onClick={sttRecognizerRef.current ? sttStopRecognition : sttStartRecognition}
                    style={{
                      padding: '5px 8px',
                      fontSize: '12px',
                      color: sttRecognizerRef.current ? '#ffffff' : '',
                      backgroundColor: sttRecognizerRef.current ? '#ff4d4f' : '',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      display: isRealtime ? 'none' : ''
                    }}
                  >
                    {sttRecognizerRef.current ? <Mic /> : (
                      sttRecognizerConnectingRef.current ? <Clock /> : <MicOff />
                    )}
                  </button>

                </div>
              )
            }

          </div>
        </div>

        <div className="content-right">

          <Avatar />

          <CameraComponent />

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

          {isConnectedRef.current && isRealtime && canPushToTalkRef.current && (
            <div className="content-actions">
              <Button
                label={isRecordingRef.current ? 'Release to send' : 'Push to talk'}
                icon={Mic}
                className={'container_bg'}
                buttonStyle={isRecordingRef.current ? 'alert' : 'regular'}
                style={isRecordingRef.current ? { backgroundColor: '#80cc29', color: '#ffffff' } : {}}
                disabled={!isConnectedRef.current || !canPushToTalkRef.current}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
              />
            </div>
          )}


          {isConnected && isRealtime && (<FileUploadComponent client={realtimeClientRef.current} />)}

          {isConnected && isAssistant && (<div className="content-actions container_bg"><FileViewer /></div>)}

          <div className="content-actions">
            <Button
              disabled={isConnectingRef.current}
              className={'container_bg'}
              label={isConnectedRef.current ? 'Disconnect' : (isConnectingRef.current ? 'Connecting' : 'Connect')}
              icon={isConnectedRef.current ? X : Zap}
              buttonStyle={isConnectedRef.current ? 'regular' : 'action'}
              onClick={
                isConnected ? disconnectConversation : connectConversation
              }
            />
          </div>

          <div className="visualization" style={{ display: (isConnected && isRealtime) ? '' : 'none' }}>
            <div className="visualization-entry server">
              <canvas ref={serverCanvasRef} />
            </div>
            <div className="visualization-entry client">
              <canvas ref={clientCanvasRef} />
            </div>
          </div>

          <span className="copyright-bottom">
            PRC STU Azure Team
          </span>

        </div>

      </div>
    </div>
  );
}
