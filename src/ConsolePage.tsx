import { useCallback, useEffect, useRef, useState } from 'react';

import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { ItemType } from '@theodoreniu/realtime-api-beta/dist/lib/client.js';
import { WavRecorder, WavStreamPlayer } from './lib/wavtools';
import { clientHiChinese, clientHiEnglish, notDisplay, products } from './lib/const';
import { delayFunction } from './lib/helper';
import { WavRenderer } from './lib/wav_renderer';

import { Mic, MicOff, Send, X, Zap, StopCircle, Clock } from 'react-feather';
import { Button } from './components/button/Button';
import { Toggle } from './components/toggle/Toggle';
import './ConsolePage.scss';
import ReactMarkdown from 'react-markdown';
import Markdown from 'react-markdown';
import CameraComponent from './components/CameraComponent';

import { AssistantStream } from 'openai/lib/AssistantStream';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import { createAssistant, getOpenAIClient } from './lib/openai';

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
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import Painting from './components/Painting';
import SettingsComponent from './components/Settings';
import FileUploadComponent from './components/FileUploadComponent';
import ProductList from './components/ProductList';
import { ASSISTENT_TYPE_ASSISTANT, ASSISTENT_TYPE_DEFAULT, ASSISTENT_TYPE_REALTIME } from './lib/const';
import LocalStorageViewer from './components/LocalStorageViewer';
import FileViewer from './components/FileViewer';
import { useContexts } from './AppProvider';
import Loading from './components/Loading';

/**
 * Type for result from get_weather() function call
 */
interface Coordinates {
  lat: number;
  lng: number;
  location?: string;
  temperature?: {
    value: number;
    units: string;
  };
  wind_speed?: {
    value: number;
    units: string;
  };
}


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
    setLoading,
    threadRef, setThread,
    threadJobRef, setThreadJob,
    assistantResponseBufferRef, setAssistantResponseBuffer,
    isAvatarStarted, isAvatarStartedRef, setIsAvatarStarted,
    avatarSpeechSentencesArrayRef, setAvatarSpeechSentencesArray,
    realtimeInstructionsRef, setRealtimeInstructions, replaceInstructions,
    assistantIdRef, setAssistantId,
  } = useContexts();

  const [assistantType, setAssistantType] = useState<string>(localStorage.getItem('assistanType') || ASSISTENT_TYPE_DEFAULT);

  const [isAssistant, setIsAssistant] = useState<boolean>(assistantType === ASSISTENT_TYPE_ASSISTANT);
  const [isRealtime, setIsRealtime] = useState<boolean>(assistantType === ASSISTENT_TYPE_REALTIME);

  // ----------------- avatar speech -----------------
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const currentInstructions = isAvatarStartedRef.current ? replaceInstructions('你的虚拟人形象处于关闭状态', '你的虚拟人形象处于打开状态')
      : replaceInstructions('你的虚拟人形象处于打开状态', '你的虚拟人形象处于关闭状态');

    clientRef.current.isConnected() && clientRef.current.updateSession({ instructions: currentInstructions });

  }, [isAvatarStarted]);

  // Refs for maintaining instance variables
  const avatarSynthesizerRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const htmlEncodeAvatar = (text: string): string => {
    // remove all can't speak characters
    text = text.replace(/\*/g, '');

    const entityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match]);
  };

  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const avatarAudioRef = useRef<HTMLAudioElement>(null);

  const setupWebRTCAvatar = async (
    iceServerUrl: string,
    iceServerUsername: string,
    iceServerCredential: string
  ) => {
    const useTcpForWebRTC = false;

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{
        urls: [useTcpForWebRTC ? iceServerUrl.replace(':3478', ':443?transport=tcp') : iceServerUrl],
        username: iceServerUsername,
        credential: iceServerCredential
      }],
      iceTransportPolicy: useTcpForWebRTC ? 'relay' : 'all'
    });

    peerConnectionRef.current.ontrack = (event) => {

      const video = avatarVideoRef.current;
      const audio = avatarAudioRef.current;

      if (!video || !audio) {
        console.error('avatarVideoRef or avatarAudioRef is not initialized');
        return;
      }

      console.log(event);

      if (event.track.kind === 'video') {
        video.id = 'avatarVideo';
        video.srcObject = event.streams[0];
        video.autoplay = true;
      } else if (event.track.kind === 'audio') {
        audio.id = 'avatarAudio';
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
      }

      video.onloadedmetadata = () => {
        setIsAvatarStarted(true);
        setIsAvatarLoading(false);
      };
    };

    // Add transceivers
    peerConnectionRef.current.addTransceiver('video', { direction: 'sendrecv' });
    peerConnectionRef.current.addTransceiver('audio', { direction: 'sendrecv' });

    // Start avatar
    console.log('starting avatar...');
    const result = await avatarSynthesizerRef.current.startAvatarAsync(peerConnectionRef.current);
    if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
      console.log('Avatar started successfully');
    } else {
      throw new Error(JSON.stringify(result));
    }

  };

  /**
   * Toggle avatar session
   */
  const toggleAvatar = async () => {
    if (isAvatarStartedRef.current) {
      stopAvatarSession();
    } else {
      await startAvatarSession();
    }
  };

  /**
   * Start avatar session
   */
  const startAvatarSession = async () => {
    try {
      const cogSvcSubKey = localStorage.getItem('cogSvcSubKey') || '';
      const cogSvcRegion = localStorage.getItem('cogSvcRegion') || '';
      const privateEndpoint = localStorage.getItem('privateEndpoint') || '';

      if (!cogSvcSubKey || !cogSvcRegion) {
        alert('Please set your Cognitive Services subscription key, region, and private endpoint.');
        setIsAvatarLoading(false);
        setIsAvatarStarted(false);
        return;
      }

      setIsAvatarLoading(true);
      console.log('starting avatar session...');

      let speechSynthesisConfig;
      if (privateEndpoint) {
        console.log(`using private endpoint: ${privateEndpoint}`);
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromEndpoint(
          new URL(`wss://${privateEndpoint}/tts/cognitiveservices/websocket/v1?enableTalkingAvatar=true`),
          cogSvcSubKey
        );
      } else {
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);
        console.log(`using public endpoint: ${cogSvcRegion}`);
      }

      const videoFormat = new SpeechSDK.AvatarVideoFormat();
      videoFormat.width = 300;
      videoFormat.height = 250;
      videoFormat.setCropRange(
        new SpeechSDK.Coordinate(600, 0),
        new SpeechSDK.Coordinate(1360, 520)
      );
      console.log('videoFormat: ' + videoFormat);

      const avatarConfig = new SpeechSDK.AvatarConfig(
        'harry',
        'business',
        videoFormat
      );
      console.log('avatarConfig: ' + avatarConfig);
      avatarConfig.customized = false;
      avatarConfig.backgroundImage = new URL('https://playground.azuretsp.com/images/avatar_bg.jpg');

      // Get token
      const response = await fetch(
        privateEndpoint
          ? `https://${privateEndpoint}/tts/cognitiveservices/avatar/relay/token/v1`
          : `https://${cogSvcRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': cogSvcSubKey
          }
        }
      );

      const responseData = await response.json();
      console.log('responseData: ' + responseData);

      avatarSynthesizerRef.current = new SpeechSDK.AvatarSynthesizer(
        speechSynthesisConfig,
        avatarConfig
      );

      await setupWebRTCAvatar(
        responseData.Urls[0],
        responseData.Username,
        responseData.Password
      );
      console.log('avatarSynthesizerRef.current: ' + avatarSynthesizerRef.current);
    } catch (error) {
      console.log(error);
      alert(`Avatar session failed to start. Please check your configuration or network.\n` + error);
      setIsAvatarLoading(false);
      setIsAvatarStarted(false);
    }
  };


  const speakAvatar = async (spokenText: string) => {
    if (!avatarSynthesizerRef.current) return;

    try {
      setIsSpeaking(true);
      const ttsVoice = 'en-US-AndrewMultilingualNeural';
      const spokenSsml = `
          <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'>
            <voice name='${ttsVoice}'>
              <mstts:leadingsilence-exact value='0'/>
              ${htmlEncodeAvatar(spokenText)}
            </voice>
          </speak>`;

      const result = await avatarSynthesizerRef.current.speakSsmlAsync(spokenSsml);
      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log(`Speech completed: ${spokenText}`);
        setIsSpeaking(false);
      } else {
        throw new Error('Speech synthesis failed: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Stop speaking avatar
   */
  const stopAvatarSpeaking = async () => {
    if (!avatarSynthesizerRef.current) return;

    try {
      await avatarSynthesizerRef.current.stopSpeakingAsync();
      setIsSpeaking(false);
    } catch (error) {
      console.log(error);
    }
  };

  const stopAvatarSession = () => {
    if (avatarSynthesizerRef.current) {
      avatarSynthesizerRef.current.close();
    }
    setIsAvatarStarted(false);
    setIsAvatarLoading(false);
    if (avatarVideoRef.current) {
      avatarVideoRef.current.srcObject = null;
    }
    if (avatarAudioRef.current) {
      avatarAudioRef.current.srcObject = null;
    }
  };
  // ----------------- avatar speech -----------------

  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      {
        apiKey: localStorage.getItem('key') || '',
        url: localStorage.getItem('endpoint') || '',
        debug: false,
        dangerouslyAllowAPIKeyInBrowser: true
      }
    )
  );

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
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState('Awaiting Connection...');
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const [coords, setCoords] = useState<Coordinates | null>({
    lat: 39.9841,
    lng: 116.3125
  });
  const [marker, setMarker] = useState<Coordinates | null>(null);

  // if connected is false, clear all items
  useEffect(() => {
    if (isConnected == false) {
      setItems([]);
    }
  }, [isConnected]);

  /**
   * Night mode toggle
   */
  const [isNightMode, setIsNightMode] = useState(false);
  useEffect(() => {

    if (isNightMode) {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }

    const currentInstructions = isNightMode ? replaceInstructions('你的界面现在是白天模式', '你的界面现在是夜间模式')
      : replaceInstructions('你的界面现在是夜间模式', '你的界面现在是白天模式');

    clientRef.current.isConnected() && clientRef.current.updateSession({ instructions: currentInstructions });

  }, [isNightMode]);

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
  };

  /**
   * Utility for formatting the timing of logs
   */
  const formatTime = useCallback((timestamp: string) => {
    const startTime = startTimeRef.current;
    const t0 = new Date(startTime).valueOf();
    const t1 = new Date(timestamp).valueOf();
    const delta = t1 - t0;
    const hs = Math.floor(delta / 10) % 100;
    const s = Math.floor(delta / 1000) % 60;
    const m = Math.floor(delta / 60_000) % 60;
    const pad = (n: number) => {
      let s = n + '';
      while (s.length < 2) {
        s = '0' + s;
      }
      return s;
    };
    return `${pad(m)}:${pad(s)}.${pad(hs)}`;
  }, []);

  const setupAssistant = async () => {
    try {
      // const assistantId = localStorage.getItem('assistantId') || '';
      // if (assistantId) {
      //   console.log(`Assistant already exists: ${assistantId}`);
      //   return;
      // }
      const assistantResponse = await createAssistant();
      console.log(`Assistant created: ${JSON.stringify(assistantResponse)}`);
      setAssistantId(assistantResponse.id);
    } catch (error: any) {
      console.error(`Error creating assistant: ${error.message}`);
      alert(`Error creating assistant: ${error.message}`);
    }
  };

  /**
   * Connect to conversation:
   * WavRecorder tasK speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {

    setAssistantType(localStorage.getItem('assistanType') || ASSISTENT_TYPE_DEFAULT);

    setIsAssistant(assistantType === ASSISTENT_TYPE_ASSISTANT);
    setIsRealtime(assistantType === ASSISTENT_TYPE_REALTIME);

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

    if (!localStorage.getItem('endpoint')) {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage('Please set your Target URI.');
      return;
    }

    if (!localStorage.getItem('key')) {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectMessage('Please set your Key.');
      return;
    }

    setIsConnecting(true);
    const client = clientRef.current;
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
      alert(`${tip}\n${e}\n\nKey is "${localStorage.getItem('key')}"`);
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

    const language = localStorage.getItem('language') || 'chinese';

    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: language === 'chinese' ? clientHiChinese : clientHiEnglish
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
    // setMemoryKv({});
    // setCoords({
    //   lat: 39.9841,
    //   lng: 116.3125
    // });
    // setMarker(null);

    // const client = clientRef.current;
    // client.disconnect();

    // const wavRecorder = wavRecorderRef.current;
    // await wavRecorder.end();

    // const wavStreamPlayer = wavStreamPlayerRef.current;
    // await wavStreamPlayer.interrupt();

    // window.location.href = '/';
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  const cancleRealtimeResponse = async () => {
    const client = clientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
  };

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    try {
      const client = clientRef.current;
      const wavRecorder = wavRecorderRef.current;
      setIsRecording(false);
      await wavRecorder.pause();
      client.createResponse();
    } catch (e) {
      setIsConnecting(false);
      setIsConnected(false);
      setConnectMessage('Connection Failed. \nPlease check your network and reconnect.');
      clientRef.current.disconnect();
      console.error(e);
    }
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }

    try {
      client.updateSession({
        turn_detection: value === 'none' ? null : { type: 'server_vad' }
      });
      if (value === 'server_vad' && client.isConnected()) {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }
      setCanPushToTalk(value === 'none');
    } catch (e) {
      setIsConnecting(false);
      setIsConnected(false);
      setConnectMessage('Connection Failed. \nPlease check your network and reconnect.');
      client.disconnect();
      console.error(e);
    }

  };

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

  const memoryTool: Function = async ({ key, value }: { [key: string]: any }) => {
    setMemoryKv((memoryKv) => {
      const newKv = { ...memoryKv };
      newKv[key] = value;
      return newKv;
    });
    return { ok: true };
  };

  const weatherTool: Function = async ({ lat, lng, location }: { [key: string]: any }) => {
    isAssistant && setLoading(true);
    setMarker({ lat, lng, location });
    setCoords({ lat, lng, location });
    const result = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
    );
    const json = await result.json();
    const temperature = {
      value: json.current.temperature_2m as number,
      units: json.current_units.temperature_2m as string
    };
    const wind_speed = {
      value: json.current.wind_speed_10m as number,
      units: json.current_units.wind_speed_10m as string
    };
    setMarker({ lat, lng, location, temperature, wind_speed });
    isAssistant && setLoading(false);
    return json;
  };

  const avatarTool: Function = async ({ on }: { [key: string]: boolean }) => {

    if (on) {
      const cogSvcSubKey = localStorage.getItem('cogSvcSubKey') || '';
      const cogSvcRegion = localStorage.getItem('cogSvcRegion') || '';

      if (!cogSvcSubKey || !cogSvcRegion) {
        return { message: 'Please set your Cognitive Services subscription key and region.' };
      }

      await startAvatarSession();

      let checkTime = 0;

      while (checkTime < 10) {
        await delayFunction(1000);
        checkTime++;
        if (isAvatarStartedRef.current) {
          return { message: 'ok' };
        }
      }

      return { message: 'Error, please check your error message.' };
    }

    stopAvatarSession();

    return { message: 'done' };
  };

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

  const dark_tool: Function = ({ on }: { [on: string]: boolean }) => {
    setIsNightMode(on);
    return { ok: true };
  };


  // process and store sentence for speech
  type SentenceStatus = { sentence: string; exists: boolean };

  function splitTextByFirstPunctuation(text: string): [string, string] {
    const punctuationRegex = /[,!?:;'"，。！？：；‘’“”（）【】《》]/;

    const match = text.match(punctuationRegex);

    if (match) {
      const index = match.index!;
      return [text.slice(0, index + 1), text.slice(index + 1)];
    }

    return ['', text];
  }

  function processAndStoreSentence(id: string, input: string): SentenceStatus[] {
    if (!input) {
      return [];
    }

    // remove all url like http, https in input
    const urlRegex = /https?:\/\/[^\s]+/g;
    input = input.replace(urlRegex, '');

    const [firstPart, remainingPart] = splitTextByFirstPunctuation(input);

    const sentenceRegex = /.*?[,!?。！？\n]/g;
    const sentences = remainingPart.match(sentenceRegex)?.map(s => s.trim()).filter(Boolean) || [];
    // add first part to sentences
    if (firstPart) {
      sentences.unshift(firstPart);
    }

    const existingSentences: string[] = avatarSpeechSentencesArrayRef.current;
    
    const result: SentenceStatus[] = sentences.map(sentence => {
      const sentenceId = `${id}-${sentence}`;
      const exists = existingSentences.includes(sentenceId);
      if (!exists) {
        existingSentences.push(sentenceId);
      }
      return { sentence, exists };
    });

    setAvatarSpeechSentencesArray(existingSentences);

    return result;
  }


  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: realtimeInstructionsRef.current });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });
    // Set voice
    client.updateSession({ voice: 'echo' });

    // Add tools
    client.addTool(memory.definition, memoryTool);
    client.addTool(weather.definition, weatherTool);
    client.addTool(avatar.definition, avatarTool);
    client.addTool(order_get.definition, order_get_tool);
    client.addTool(order_return.definition, order_return_tool);
    client.addTool(dark.definition, dark_tool);
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

  const memberRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [sttRecognizer, setSttRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);
  const [sttRecognizerConnecting, setSttRecognizerConnecting] = useState(false);

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

  const [inputValue, setInputValue] = useState('');

  const [messagesAssistant, setMessagesAssistant] = useState<any[]>([]);
  const [assistantRunning, setAssistantRunning] = useState(false);

  // automatically scroll to bottom of chat
  const messagesEndAssistantRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollToBottom = () => {
    messagesEndAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    assistantScrollToBottom();
  }, [messagesAssistant]);


  const stopCurrentStreamJob = async () => {
    if (!threadJobRef.current) return;

    console.log('stopCurrentStreamJob:', threadJobRef.current);

    try {
      const cancelJob = await getOpenAIClient().beta.threads.runs.cancel(threadRef.current?.id, threadJobRef.current?.id);
      console.log('cancelJob', cancelJob);
    } catch (error) {
      console.error('cancelJob error', error);
    }

    setThreadJob(null);
  };

  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    if (isAssistant) {
      await stopCurrentStreamJob();
      setAssistantResponseBuffer('')
      stopAvatarSpeaking();
      sendAssistantMessage(inputValue);
      setMessagesAssistant((prevMessages: any) => [
        ...prevMessages,
        { role: 'user', text: inputValue }
      ]);
      setAssistantRunning(true);
      assistantScrollToBottom();
      setInputValue('');
      return;
    }

    stopAvatarSpeaking();
    cancleRealtimeResponse();
    clientRef.current.sendUserMessageContent([
      {
        type: `input_text`,
        text: inputValue
      }
    ]);
    setInputValue('');
    console.log('send text', inputValue);
  };

  const sttStartRecognition = () => {
    cancleRealtimeResponse();
    setSttRecognizerConnecting(true);

    const cogSvcSubKey = localStorage.getItem('cogSvcSubKey') || '';
    const cogSvcRegion = localStorage.getItem('cogSvcRegion') || '';

    const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(['zh-CN', 'en-US']);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const newRecognizer = SpeechSDK.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);

    newRecognizer.recognizing = (s, e) => {
      console.log(`Recognizing: ${e.result.text}`);
      setInputValue(e.result.text);

      (async () => {
        await stopCurrentStreamJob();
      })();

      stopAvatarSpeaking();
      cancleRealtimeResponse();
    };

    newRecognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        console.log(`Final result: ${e.result.text}`);
        setInputValue(e.result.text);
        sendText(e.result.text);
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        console.log('No speech recognized.');
      }
    };

    // Speech Ended / Silence
    newRecognizer.speechEndDetected = () => {
      console.log('Silence detected. Stopping recognition.');
      sttStopRecognition();
    };

    newRecognizer.canceled = (s, e) => {
      console.error(`Canceled: ${e.reason}`);
      newRecognizer.stopContinuousRecognitionAsync();
    };

    newRecognizer.sessionStopped = () => {
      console.log('Session stopped.');
      newRecognizer.stopContinuousRecognitionAsync();
    };

    newRecognizer.startContinuousRecognitionAsync(
      () => {
        console.log('Recognition started.');
        setSttRecognizer(newRecognizer);
        setSttRecognizerConnecting(false);
      },
      (err) => {
        console.error('Error starting recognition:', err);
        setSttRecognizerConnecting(false);
      }
    );
  };

  const sttStopRecognition = () => {
    if (sttRecognizer) {
      sttRecognizer.stopContinuousRecognitionAsync(() => {
        console.log('Recognition stopped.');
        // setTranscript((prev) => `${prev}\n--- Recognition Stopped ---\n`);
        setSttRecognizer(null);
        setSttRecognizerConnecting(false);
      });
    }

    setInputValue('');
  };

  const functionCallHandler = async (call: any) => {
    const args = JSON.parse(call.function.arguments);

    switch (call?.function?.name) {
      case 'get_weather':
        return JSON.stringify(
          await weatherTool({ lat: args.lat, lng: args.lng, location: args.location })
        );
      case 'pronunciation_assessment':
        return JSON.stringify(
          await pronunciation_assessment.handler({ sentence: args.sentence })
        );
      default:
        return;
    }

  };

  const createThread = async () => {
    const thread = await getOpenAIClient().beta.threads.create();
    console.log('thread', thread);
    setThread(thread);
  };

  const sendAssistantMessage = async (text: string) => {
    await getOpenAIClient().beta.threads.messages.create(threadRef.current?.id, {
      role: 'user',
      content: text
    });

    const stream = getOpenAIClient().beta.threads.runs.stream(threadRef.current?.id, {
      assistant_id: assistantIdRef.current
    });

    const new_stream = AssistantStream.fromReadableStream(stream.toReadableStream());

    handleAssistantReadableStream(new_stream);
  };

  const submitAssistantActionResult = async (runId: string, toolCallOutputs: {
    output: string,
    tool_call_id: string
  }[]) => {
    const stream = getOpenAIClient().beta.threads.runs.submitToolOutputsStream(
      threadRef.current?.id,
      runId,
      // { tool_outputs: [{ output: result, tool_call_id: toolCallId }] },
      { tool_outputs: toolCallOutputs }
    );

    const new_stream = AssistantStream.fromReadableStream(stream.toReadableStream());
    handleAssistantReadableStream(new_stream);
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleAssistantTextCreated = () => {
    appendAssistantMessage('assistant', '');
  };

  // textDelta - append text to last assistant message
  const handleAssistantTextDelta = (delta: any) => {
    if (delta.value != null) {

      const latestText = assistantResponseBufferRef.current + delta.value;
      setAssistantResponseBuffer(latestText);

      const sentences = processAndStoreSentence(threadRef.current?.id, latestText);

      for (const sentence of sentences) {
        if (sentence.exists === false) {
          console.log(`Speech Need: ${sentence.sentence}`);
          if (isAvatarStartedRef.current) {
            speakAvatar(sentence.sentence);
          } else {
            // textToSpeechAndPlay(sentence.sentence);
          }
        }
      }

      appendAssistantToLastMessage(delta.value);
    }

    if (delta.annotations != null) {
      annotateAssistantLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleAssistantImageFileDone = (image: any) => {
    appendAssistantToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  };

  // toolCallCreated - log new tool call
  const toolAssistantCallCreated = (toolCall: any) => {
    if (toolCall.type != 'code_interpreter') return;
    appendAssistantMessage('code', '');
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolAssistantCallDelta = (delta: any, snapshot: any) => {
    if (delta.type != 'code_interpreter') return;
    if (!delta.code_interpreter.input) return;
    appendAssistantToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleAssistantRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall: any) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setAssistantRunning(true);
    submitAssistantActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleAssistantRunCompleted = () => {
    setAssistantRunning(false);
    setThreadJob(null);
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

      if (event.event === 'thread.run.requires_action')
        handleAssistantRequiresAction(event);
      if (event.event === 'thread.run.completed') handleAssistantRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendAssistantToLastMessage = (text: string) => {
    setMessagesAssistant((prevMessages: any) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const latestText = lastMessage.text + text
      const updatedLastMessage = {
        ...lastMessage,
        text: latestText
      };

      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendAssistantMessage = (role: string, text: string) => {
    setMessagesAssistant((prevMessages: any) => [...prevMessages, { role, text }]);
  };

  const annotateAssistantLastMessage = (annotations: any) => {
    setMessagesAssistant((prevMessages: any) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage
      };
      annotations.forEach((annotation: any) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });

  };

  /**
   * Render the application
   */
  return (
    <div data-component="ConsolePage">

      <Loading />

      <Painting client={clientRef.current} wavStreamPlayer={wavStreamPlayerRef.current} />

      <div className="content-top">

        <div className="content-title">
          <img src="/logomark.svg" alt="logo" />
          <h1>AI Agent Playground</h1>
        </div>


        <span className="copyright">
          PRC STU Azure Team
        </span>

        <span onClick={toggleNightMode} style={{ cursor: 'pointer' }}>
          {isNightMode ? '☀️' : '🌙'}
        </span>

        <LocalStorageViewer />

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
              {items.map((conversationItem, i) => {

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
                    value={inputValue}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendText(inputValue);
                      }
                      if (e.key === 'Escape') {
                        setInputValue('');
                      }
                    }} onChange={(e) => setInputValue(e.target.value)} />

                  <button onClick={() => sendText(inputValue)}
                    style={{ display: inputValue ? '' : 'none' }}
                    disabled={!inputValue}><Send /></button>


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
                    onClick={sttRecognizer ? sttStopRecognition : sttStartRecognition}
                    style={{
                      padding: '5px 8px',
                      fontSize: '12px',
                      color: sttRecognizer ? '#ffffff' : '',
                      backgroundColor: sttRecognizer ? '#ff4d4f' : '',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      display: isRealtime ? 'none' : ''
                    }}
                  >
                    {sttRecognizer ? <Mic /> : (
                      sttRecognizerConnecting ? <Clock /> : <MicOff />
                    )}
                  </button>

                </div>
              )
            }

          </div>
        </div>

        <div className="content-right">

          <div className="content-actions container_bg remoteVideo">
            {
              isAvatarLoading ? <div className="camLoading">
                <div className="spinner" key={'avatarLoading'}></div>
              </div> : null
            }
            <button className="content-block-btn"
              onClick={toggleAvatar}
              style={{ display: isAvatarLoading ? 'none' : '' }}
            // disabled={isAvatarLoading}
            >
              {isAvatarStartedRef.current ? 'Off' : 'On'}
            </button>
            <video ref={avatarVideoRef} style={{ display: isAvatarStartedRef.current ? '' : 'none' }}>Your browser does not support
              the video tag.
            </video>
            <audio ref={avatarAudioRef} style={{ display: isAvatarStartedRef.current ? '' : 'none' }}>Your browser does not support
              the audio tag.
            </audio>
          </div>

          <CameraComponent client={clientRef.current} wavStreamPlayer={wavStreamPlayerRef.current}
            assistantThreadId={threadRef.current?.id} />

          {!isConnected && (
            <SettingsComponent client={clientRef.current} />
          )}

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


          {isConnected && isRealtime && (<FileUploadComponent client={clientRef.current} />)}

          {isConnected && isAssistant && (<div className="content-actions container_bg"><FileViewer /></div>)}

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
