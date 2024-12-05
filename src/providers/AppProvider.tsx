import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { instructions } from '../lib/instructions';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { useSettings } from './SettingsProvider';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

import * as memory from '../tools/memory';
import * as weather from '../tools/weather';
import * as avatar from '../tools/avatar';
import * as order_get from '../tools/order_get';
import * as order_return from '../tools/order_return';
import * as dark from '../tools/dark';
import * as news from '../tools/news';
import * as location from '../tools/location';
import * as stock_recommend from '../tools/stock_recommend';
import * as products_recommend from '../tools/products_recommend';
import * as demo from '../tools/demo';
import * as feishu from '../tools/feishu';
import * as camera_current from '../tools/camera_current';
import * as camera_on from '../tools/camera_on';
import * as camera_video from '../tools/camera_video';
import * as painting from '../tools/painting';
import * as pronunciation_assessment from '../tools/pronunciation_assessment';
import * as azure_docs from '../tools/azure_docs';
import * as quote from '../tools/quote';
import * as exchange_rate_aim from '../tools/exchange_rate_aim';
import * as exchange_rate_list from '../tools/exchange_rate_list';
import * as exchange_rate_configs from '../tools/exchange_rate_configs';
import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';


interface AppContextType {

  photos: string[];
  photosRef: React.MutableRefObject<string[]>;
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;

  loading: boolean;
  loadingRef: React.MutableRefObject<boolean>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  isAvatarStarted: boolean;
  isAvatarStartedRef: React.MutableRefObject<boolean>;
  setIsAvatarStarted: React.Dispatch<React.SetStateAction<boolean>>;

  debug: boolean;
  debugRef: React.MutableRefObject<boolean>;
  setDebug: React.Dispatch<React.SetStateAction<boolean>>;

  thread: any | null;
  threadRef: React.MutableRefObject<any | null>;
  setThread: React.Dispatch<React.SetStateAction<any | null>>;

  threadJob: any | null;
  threadJobRef: React.MutableRefObject<any | null>;
  setThreadJob: React.Dispatch<React.SetStateAction<any | null>>;

  assistantResponseBuffer: string;
  assistantResponseBufferRef: React.MutableRefObject<string>;
  setAssistantResponseBuffer: React.Dispatch<React.SetStateAction<string>>;

  avatarSpeechSentencesArray: string[];
  avatarSpeechSentencesArrayRef: React.MutableRefObject<string[]>;
  setAvatarSpeechSentencesArray: React.Dispatch<React.SetStateAction<string[]>>;

  realtimeInstructions: string;
  realtimeInstructionsRef: React.MutableRefObject<string>;
  setRealtimeInstructions: React.Dispatch<React.SetStateAction<string>>;
  replaceInstructions: (source: string | RegExp, target: string) => string;

  assistant: string;
  assistantRef: React.MutableRefObject<any | null>;
  setAssistant: React.Dispatch<React.SetStateAction<any | null>>;

  isNightMode: boolean;
  isNightModeRef: React.MutableRefObject<boolean>;
  setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;

  realtimeClientRef: React.MutableRefObject<RealtimeClient>;

  isAvatarLoading: boolean;
  isAvatarLoadingRef: React.MutableRefObject<boolean>;
  setIsAvatarLoading: React.Dispatch<React.SetStateAction<boolean>>;

  isAvatarSpeaking: boolean;
  isAvatarSpeakingRef: React.MutableRefObject<boolean>;
  setIsAvatarSpeaking: React.Dispatch<React.SetStateAction<boolean>>;

  avatarSynthesizerRef: React.MutableRefObject<any>;
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>;
  avatarVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
  avatarAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  stopAvatarSession: () => void;
  startAvatarSession: () => Promise<void>;

  memoryKv: { [key: string]: any };
  memoryKvRef: React.MutableRefObject<{ [key: string]: any }>;
  setMemoryKv: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;

  inputValue: string;
  inputValueRef: React.MutableRefObject<string>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;

  isCameraOn: boolean;
  isCameraOnRef: React.MutableRefObject<boolean>;
  setIsCameraOn: React.Dispatch<React.SetStateAction<boolean>>;

  isWebcamReady: boolean;
  isWebcamReadyRef: React.MutableRefObject<boolean>;
  setIsWebcamReady: React.Dispatch<React.SetStateAction<boolean>>;

  functions_tools_ref: React.MutableRefObject<any>;
}

const IS_DEBUG: boolean = window.location.href.includes('localhost');

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const { keyRef, endpointRef } = useSettings();
  const { cogSvcSubKeyRef, cogSvcRegionRef } = useSettings();

  // isCameraOn boolean
  const [isCameraOn, setIsCameraOn] = useState(false);
  const isCameraOnRef = useRef(isCameraOn);
  useEffect(() => {
    console.log(`isCameraOn: ${isCameraOn}`);
    isCameraOnRef.current = isCameraOn;
    if (!isCameraOn) {
      setIsWebcamReady(false);
      setPhotos([]);
    }
  }, [isCameraOn]);

  // isWebcamReady boolean
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const isWebcamReadyRef = useRef(isWebcamReady);
  useEffect(() => {
    isWebcamReadyRef.current = isWebcamReady;

    console.log(`iseWebcamReady: ${isWebcamReadyRef?.current}`);

    if (realtimeClientRef?.current?.isConnected()) {
      console.log('update instructions');
      realtimeClientRef?.current.updateSession({
        instructions: isCameraOnRef?.current ? replaceInstructions('现在我的摄像头是关闭的', '现在我的摄像头打开的') : replaceInstructions('现在我的摄像头打开的', '现在我的摄像头是关闭的')
      });
    } else {
      console.log('client is not connected, not update instructions');
    }

  }, [isWebcamReady]);

  // input string
  const [inputValue, setInputValue] = useState('');
  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  // photos
  const [photos, setPhotos] = useState<string[]>([]);
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // debug
  const [debug, setDebug] = useState<boolean>(IS_DEBUG);
  const debugRef = useRef(debug);
  useEffect(() => {
    debugRef.current = debug;
  }, [debug]);

  // loading
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // isAvatarStarted
  const [isAvatarStarted, setIsAvatarStarted] = useState<boolean>(false);
  const isAvatarStartedRef = useRef(isAvatarStarted);
  useEffect(() => {
    isAvatarStartedRef.current = isAvatarStarted;
    const currentInstructions = isAvatarStartedRef.current ? replaceInstructions('你的虚拟人形象处于关闭状态', '你的虚拟人形象处于打开状态')
      : replaceInstructions('你的虚拟人形象处于打开状态', '你的虚拟人形象处于关闭状态');

    realtimeClientRef.current.isConnected() && realtimeClientRef.current.updateSession({ instructions: currentInstructions });
  }, [isAvatarStarted]);

  // assistant object
  const [assistant, setAssistant] = useState<any | null>(null);
  const assistantRef = useRef(assistant);
  useEffect(() => {
    assistantRef.current = assistant;
    localStorage.setItem('assistant', JSON.stringify(assistant));
  }, [assistant]);

  // thread
  const [thread, setThread] = useState<any | null>(null);
  const threadRef = useRef(thread);
  useEffect(() => {
    threadRef.current = thread;
  }, [thread]);

  // threadJob
  const [threadJob, setThreadJob] = useState<any | null>(null);
  const threadJobRef = useRef(threadJob);
  useEffect(() => {
    threadJobRef.current = threadJob;
  }, [threadJob]);

  // assistantResponseBuffer string
  const [assistantResponseBuffer, setAssistantResponseBuffer] = useState<string>('');
  const assistantResponseBufferRef = useRef(assistantResponseBuffer);
  useEffect(() => {
    assistantResponseBufferRef.current = assistantResponseBuffer;
  }, [assistantResponseBuffer]);

  // avatarSpeechSentencesArray array
  const [avatarSpeechSentencesArray, setAvatarSpeechSentencesArray] = useState<string[]>([]);
  const avatarSpeechSentencesArrayRef = useRef(avatarSpeechSentencesArray);
  useEffect(() => {
    avatarSpeechSentencesArrayRef.current = avatarSpeechSentencesArray;
  }, [avatarSpeechSentencesArray]);

  const prompt = localStorage.getItem('prompt') || '';

  // realtime instructions string
  const updateInstructions = prompt ? `${instructions}\n\nOther requirements of the user: \n${prompt}` : instructions;
  const [realtimeInstructions, setRealtimeInstructions] = useState<string>(updateInstructions);
  const realtimeInstructionsRef = useRef(realtimeInstructions);
  useEffect(() => {
    realtimeInstructionsRef.current = realtimeInstructions;
  }, [realtimeInstructions]);
  const replaceInstructions = (source: string | RegExp, target: string) => {
    const new_instructions = realtimeInstructionsRef.current.replace(source, target);
    setRealtimeInstructions(new_instructions);
    return new_instructions;
  };

  // isNightMode boolean
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const isNightModeRef = useRef(isNightMode);
  useEffect(() => {
    isNightModeRef.current = isNightMode;

    if (isNightMode) {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }

    const currentInstructions = isNightMode ? replaceInstructions('你的界面现在是白天模式', '你的界面现在是夜间模式')
      : replaceInstructions('你的界面现在是夜间模式', '你的界面现在是白天模式');

    if (realtimeClientRef?.current?.isConnected()) {
      realtimeClientRef.current.updateSession({ instructions: currentInstructions });
      console.log('updated instructions');
    }

  }, [isNightMode]);

  // realtime client
  const realtimeClientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      {
        apiKey: keyRef.current,
        url: endpointRef.current,
        debug: false,
        dangerouslyAllowAPIKeyInBrowser: true
      }
    )
  );

  // isAvatarLoading boolean
  const [isAvatarLoading, setIsAvatarLoading] = useState<boolean>(false);
  const isAvatarLoadingRef = useRef(isAvatarLoading);
  useEffect(() => {
    isAvatarLoadingRef.current = isAvatarLoading;
  }, [isAvatarLoading]);

  // isAvatarSpeaking boolean
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState<boolean>(false);
  const isAvatarSpeakingRef = useRef(isAvatarSpeaking);
  useEffect(() => {
    isAvatarSpeakingRef.current = isAvatarSpeaking;
  }, [isAvatarSpeaking]);

  // avatarSynthesizer
  const avatarSynthesizerRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const avatarAudioRef = useRef<HTMLAudioElement>(null);
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

  // functions_tools array
  const functions_tools_ref = useRef<[ToolDefinitionType, Function][]>([
    [memory.definition, memory.handler],
    [weather.definition, weather.handler],
    [avatar.definition, avatar.handler],
    [order_get.definition, order_get.handler],
    [order_return.definition, order_return.handler],
    [dark.definition, dark.handler],
    [news.definition, news.handler],
    [exchange_rate_aim.definition, exchange_rate_aim.handler],
    [exchange_rate_list.definition, exchange_rate_list.handler],
    [exchange_rate_configs.definition, exchange_rate_configs.handler],
    [products_recommend.definition, products_recommend.handler],
    [location.definition, location.handler],
    [feishu.definition, feishu.handler],
    [camera_on.definition, camera_on.handler],
    [camera_current.definition, camera_current.handler],
    [camera_video.definition, camera_video.handler],
    [painting.definition, painting.handler],
    [pronunciation_assessment.definition, pronunciation_assessment.handler],
    [azure_docs.definition, azure_docs.handler],
    [demo.definition, demo.handler],
    [quote.definition, quote.handler],
    [stock_recommend.definition, stock_recommend.handler],
  ]);

  const startAvatarSession = async () => {
    try {


      const privateEndpoint = localStorage.getItem('privateEndpoint') || '';

      if (!cogSvcSubKeyRef.current || !cogSvcRegionRef.current) {
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
          cogSvcSubKeyRef.current
        );
      } else {
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKeyRef.current, cogSvcRegionRef.current);
        console.log(`using public endpoint: ${cogSvcRegionRef.current}`);
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
          : `https://${cogSvcRegionRef.current}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': cogSvcSubKeyRef.current
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

  // memoryKv
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const memoryKvRef = useRef(memoryKv);
  useEffect(() => {
    memoryKvRef.current = memoryKv;
  }, [memoryKv]);


  // ---------------- functions -----------------

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.ctrlKey &&
      event.altKey &&
      (event.key === 'p' || event.key === 'P')
    ) {
      event.preventDefault();
      setDebug((prevMyVariable) => {
        const newValue = !prevMyVariable;
        return newValue;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      photos, photosRef, setPhotos,
      loading, loadingRef, setLoading,
      isAvatarStarted, isAvatarStartedRef, setIsAvatarStarted,
      debug, debugRef, setDebug,
      assistant: assistant, assistantRef: assistantRef, setAssistant: setAssistant,
      thread, threadRef, setThread,
      threadJob, threadJobRef, setThreadJob,
      assistantResponseBuffer, assistantResponseBufferRef, setAssistantResponseBuffer,
      avatarSpeechSentencesArray, avatarSpeechSentencesArrayRef, setAvatarSpeechSentencesArray,
      realtimeInstructions, realtimeInstructionsRef, setRealtimeInstructions, replaceInstructions,
      isNightMode, isNightModeRef, setIsNightMode,
      realtimeClientRef,
      isAvatarLoading, isAvatarLoadingRef, setIsAvatarLoading,
      isAvatarSpeaking, isAvatarSpeakingRef, setIsAvatarSpeaking,
      avatarSynthesizerRef,
      peerConnectionRef,
      avatarVideoRef,
      avatarAudioRef,
      stopAvatarSession,
      startAvatarSession,
      memoryKv, memoryKvRef, setMemoryKv,
      inputValue, inputValueRef, setInputValue,
      isCameraOn, isCameraOnRef, setIsCameraOn,
      isWebcamReady, isWebcamReadyRef, setIsWebcamReady,
      functions_tools_ref
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useContexts = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useContexts must be used within a AppProvider');
  }
  return context;
};
