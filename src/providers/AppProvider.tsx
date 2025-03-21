import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SYSTEM_INSTRUCTIONS } from '../lib/instructions';

import * as memory from '../tools/memory';
import * as weather from '../tools/weather';
import * as avatar from '../tools/avatar';
import * as order_get from '../tools/order_get';
import * as order_return from '../tools/order_return';
import * as bing from '../tools/bing';
import * as dark from '../tools/dark';
import * as news from '../tools/news';
import * as location from '../tools/location';
import * as stock_recommend from '../tools/stock_recommend';
import * as products_recommend from '../tools/products_recommend';
import * as demo from '../tools/demo';
import * as feishu from '../tools/feishu';
import * as background from '../tools/background';
import * as open_url from '../tools/open_url';
import * as debug_model from '../tools/debug_model';
import * as set_disconnection from '../tools/set_disconnection';
import * as camera_current from '../tools/camera_current';
import * as camera_on from '../tools/camera_on';
import * as camera_take_photo from '../tools/camera_take_photo';
import * as opacity from '../tools/opacity';
import * as devices_action from '../tools/devices_action';
import * as camera_video from '../tools/camera_video';
import * as painting from '../tools/painting';
import * as image_modify from '../tools/painting_modify';
import * as azure_docs from '../tools/azure_docs';
import * as quote from '../tools/quote';
import * as exchange_rate_aim from '../tools/exchange_rate_aim';
import * as exchange_rate_list from '../tools/exchange_rate_list';
import * as exchange_rate_configs from '../tools/exchange_rate_configs';

import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import {
  AVATAR_OFF,
  AVATAR_READY,
  AVATAR_STARTING,
  CAMERA_OFF,
  CAMERA_PHOTO_LIMIT,
  CAMERA_READY,
  CAMERA_STARTING,
  CONNECT_DISCONNECTED,
} from '../lib/const';
import {
  editImages,
  getCompletion,
  getImages,
  getOpenAIClient,
} from '../lib/openai';
import { delayFunction } from '../lib/helper';
import { Assistant } from 'openai/resources/beta/assistants';
import { processAndStoreSentence } from '../lib/sentence';
import axios from 'axios';
import { GptImage } from '../types/GptImage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  useGptImagesDispatch,
  useGptImagesRef,
} from '../contexts/GptImagesContext';
import { VectorStore } from 'openai/resources/vector-stores/vector-stores';
import { Profiles } from '../lib/Profiles';
import { GRAPHRAG_ABOUT } from '../tools/azure_docs';

interface AppContextType {
  photos: string[];
  photosRef: React.MutableRefObject<string[]>;
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  debug: boolean;
  debugRef: React.MutableRefObject<boolean>;
  setDebug: React.Dispatch<React.SetStateAction<boolean>>;

  thread: any | null;
  threadRef: React.MutableRefObject<any | null>;
  setThread: React.Dispatch<React.SetStateAction<any | null>>;

  threadJob: any | null;
  threadJobRef: React.MutableRefObject<any | null>;
  setThreadJob: React.Dispatch<React.SetStateAction<any | null>>;

  responseBuffer: string;
  responseBufferRef: React.MutableRefObject<string>;
  setResponseBuffer: React.Dispatch<React.SetStateAction<string>>;

  speechSentencesCacheArray: string[];
  speechSentencesCacheArrayRef: React.MutableRefObject<string[]>;
  setSpeechSentencesCacheArray: React.Dispatch<React.SetStateAction<string[]>>;

  llmInstructions: string;
  llmInstructionsRef: React.MutableRefObject<string>;
  replaceInstructions: (source: string | RegExp, target: string) => string;

  cameraStatus: string;
  cameraStatusRef: React.MutableRefObject<string>;
  setCameraStatus: React.Dispatch<React.SetStateAction<string>>;

  connectStatus: string;
  connectStatusRef: React.MutableRefObject<string>;
  setConnectStatus: React.Dispatch<React.SetStateAction<string>>;

  avatarStatus: string;
  avatarStatusRef: React.MutableRefObject<string>;
  setAvatarStatus: React.Dispatch<React.SetStateAction<string>>;

  assistant: Assistant | null;
  assistantRef: React.MutableRefObject<Assistant | null>;
  setAssistant: React.Dispatch<React.SetStateAction<Assistant | null>>;

  vectorStore: VectorStore | null;
  vectorStoreRef: React.MutableRefObject<VectorStore | null>;
  setVectorStore: React.Dispatch<React.SetStateAction<VectorStore | null>>;

  isNightMode: boolean;
  isNightModeRef: React.MutableRefObject<boolean>;
  setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;

  isAvatarSpeaking: boolean;
  setIsAvatarSpeaking: React.Dispatch<React.SetStateAction<boolean>>;

  memoryKv: { [key: string]: any };
  memoryKvRef: React.MutableRefObject<{ [key: string]: any }>;
  setMemoryKv: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;

  inputValue: string;
  inputValueRef: React.MutableRefObject<string>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;

  needSpeechQueue: string[];
  needSpeechQueueRef: React.MutableRefObject<string[]>;
  setNeedSpeechQueue: React.Dispatch<React.SetStateAction<string[]>>;

  functionsToolsRef: React.MutableRefObject<[ToolDefinitionType, Function][]>;

  caption: string;
  captionRef: React.MutableRefObject<string>;
  setCaption: React.Dispatch<React.SetStateAction<string>>;

  inputTokens: number;
  inputTokensRef: React.MutableRefObject<number>;
  setInputTokens: React.Dispatch<React.SetStateAction<number>>;

  inputTextTokens: number;
  inputTextTokensRef: React.MutableRefObject<number>;
  setInputTextTokens: React.Dispatch<React.SetStateAction<number>>;

  inputAudioTokens: number;
  inputAudioTokensRef: React.MutableRefObject<number>;
  setInputAudioTokens: React.Dispatch<React.SetStateAction<number>>;

  outputTokens: number;
  outputTokensRef: React.MutableRefObject<number>;
  setOutputTokens: React.Dispatch<React.SetStateAction<number>>;

  outputTextTokens: number;
  outputTextTokensRef: React.MutableRefObject<number>;
  setOutputTextTokens: React.Dispatch<React.SetStateAction<number>>;

  outputAudioTokens: number;
  outputAudioTokensRef: React.MutableRefObject<number>;
  setOutputAudioTokens: React.Dispatch<React.SetStateAction<number>>;

  captionQueue: string[];
  captionQueueRef: React.MutableRefObject<string[]>;
  setCaptionQueue: React.Dispatch<React.SetStateAction<string[]>>;
  updateCaptionQueue: (caption: string) => void;
  addCaptionQueue: (caption: string) => void;

  bingSearchData: any;
  setBingSearchData: React.Dispatch<React.SetStateAction<any>>;

  isOnline: boolean;

  isFirstTokenRef: React.MutableRefObject<boolean>;

  firstTokenLatencyArray: number[];
  firstTokenLatencyArrayRef: React.MutableRefObject<number[]>;
  setFirstTokenLatencyArray: React.Dispatch<React.SetStateAction<number[]>>;

  sendTimeRef: React.MutableRefObject<number>;
  lastTokenTimeRef: React.MutableRefObject<number>;

  tokenLatencyArray: number[];
  tokenLatencyArrayRef: React.MutableRefObject<number[]>;
  setTokenLatencyArray: React.Dispatch<React.SetStateAction<number[]>>;

  resetTokenLatency: () => void;
  recordTokenLatency: (delta: any) => void;

  connectMessage: string;
  setConnectMessage: React.Dispatch<React.SetStateAction<string>>;

  resetApp: () => void;

  isDebugMode: boolean;
  isDebugModeRef: React.MutableRefObject<boolean>;
  setIsDebugMode: React.Dispatch<React.SetStateAction<boolean>>;

  appKey: number;

  loadFunctionsTools: [ToolDefinitionType, Function][];
  builtinFunctionTools: [ToolDefinitionType, Function][];

  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

const IS_DEBUG: boolean = window.location.href.includes('localhost');

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: ReactNode;
  appKey: number;
  setAppKey: React.Dispatch<React.SetStateAction<number>>;
  isNightMode: boolean;
  setIsNightMode: React.Dispatch<React.SetStateAction<boolean>>;
  setOpacity: React.Dispatch<React.SetStateAction<number>>;
  setBackground: React.Dispatch<React.SetStateAction<string>>;
  loadFunctionsTools: [ToolDefinitionType, Function][];
}> = ({
  children,
  appKey,
  setAppKey,
  isNightMode,
  setIsNightMode,
  setOpacity,
  setBackground,
  loadFunctionsTools,
}) => {
    const isOnline = useOnlineStatus();

    const [profiles, setProfiles] = useState<Profiles>(new Profiles());

    // caption string
    const [caption, setCaption] = useState('');
    const captionRef = useRef(caption);
    useEffect(() => {
      captionRef.current = caption;
    }, [caption]);

    // captionQueue string[]
    const [captionQueue, setCaptionQueue] = useState<string[]>([]);
    const captionQueueRef = useRef<string[]>([]);
    const updateCaptionQueue = (caption: string) => {
      if (captionQueueRef.current.length === 0) {
        return;
      }
      if (captionQueueRef.current[0] === caption) {
        setCaptionQueue(captionQueueRef.current.slice(1));
      }
    };
    const addCaptionQueue = (caption: string) => {
      setCaptionQueue([...captionQueueRef.current, caption]);
    };

    // inputTokens number
    const [inputTokens, setInputTokens] = useState(0);
    const inputTokensRef = useRef(inputTokens);

    // inputTextTokens number
    const [inputTextTokens, setInputTextTokens] = useState(0);
    const inputTextTokensRef = useRef(inputTextTokens);

    // inputAudioTokens number
    const [inputAudioTokens, setInputAudioTokens] = useState(0);
    const inputAudioTokensRef = useRef(inputAudioTokens);

    // outputTokens number
    const [outputTokens, setOutputTokens] = useState(0);
    const outputTokensRef = useRef(outputTokens);

    // outputTextTokens number
    const [outputTextTokens, setOutputTextTokens] = useState(0);
    const outputTextTokensRef = useRef(outputTextTokens);

    // outputAudioTokens number
    const [outputAudioTokens, setOutputAudioTokens] = useState(0);
    const outputAudioTokensRef = useRef(outputAudioTokens);

    // cameraStatus string
    const [cameraStatus, setCameraStatus] = useState(CAMERA_OFF);
    const cameraStatusRef = useRef(cameraStatus);
    useEffect(() => {
      cameraStatusRef.current = cameraStatus;
    }, [cameraStatus]);

    // connectStatus string
    const [connectStatus, setConnectStatus] = useState(CONNECT_DISCONNECTED);
    const connectStatusRef = useRef(connectStatus);
    useEffect(() => {
      connectStatusRef.current = connectStatus;
    }, [connectStatus]);

    // avatarStatus string
    const [avatarStatus, setAvatarStatus] = useState(AVATAR_OFF);
    const avatarStatusRef = useRef(avatarStatus);
    useEffect(() => {
      avatarStatusRef.current = avatarStatus;
    }, [avatarStatus]);

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

    // isDebugMode boolean
    const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
    const isDebugModeRef = useRef(isDebugMode);
    useEffect(() => {
      isDebugModeRef.current = isDebugMode;
      if (isDebugMode) {
        replaceInstructions('调试模式是关闭的', '调试模式是开启的');
      } else {
        replaceInstructions('调试模式是开启的', '调试模式是关闭的');
      }
    }, [isDebugMode]);

    // debug
    const [debug, setDebug] = useState<boolean>(IS_DEBUG);
    const debugRef = useRef(debug);
    useEffect(() => {
      debugRef.current = debug;
    }, [debug]);

    // loading
    const [loading, setLoading] = useState<boolean>(false);

    // assistant
    const [assistant, setAssistant] = useState<Assistant | null>(null);
    const assistantRef = useRef(assistant);
    useEffect(() => {
      assistantRef.current = assistant;
    }, [assistant]);

    // vectorStore
    const [vectorStore, setVectorStore] = useState<VectorStore | null>(null);
    const vectorStoreRef = useRef(vectorStore);
    useEffect(() => {
      vectorStoreRef.current = vectorStore;
    }, [vectorStore]);

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

    // connectMessage string
    const [connectMessage, setConnectMessage] = useState(
      'Awaiting Connection...',
    );

    // needSpeechQueue string[]
    const [needSpeechQueue, setNeedSpeechQueue] = useState<string[]>([]);
    const needSpeechQueueRef = useRef<string[]>([]);
    useEffect(() => {
      needSpeechQueueRef.current = needSpeechQueue;
    }, [needSpeechQueue]);

    // responseBuffer string
    const [responseBuffer, setResponseBuffer] = useState<string>('');
    const responseBufferRef = useRef(responseBuffer);
    useEffect(() => {
      responseBufferRef.current = responseBuffer;

      if (!responseBuffer) {
        setNeedSpeechQueue([]);
        setCaptionQueue([]);
        setIsAvatarSpeaking(false);
        return;
      }

      const sentences = processAndStoreSentence(
        responseBuffer,
        avatarStatus === AVATAR_READY,
        speechSentencesCacheArrayRef,
      );

      for (const sentence of sentences) {
        if (!sentence.exists) {
          console.log(`speech need speak: ${sentence.sentence}`);
          setNeedSpeechQueue([...needSpeechQueue, sentence.sentence]);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responseBuffer]);

    // speechSentencesCacheArray array
    const [speechSentencesCacheArray, setSpeechSentencesCacheArray] = useState<
      string[]
    >([]);
    const speechSentencesCacheArrayRef = useRef(speechSentencesCacheArray);
    useEffect(() => {
      speechSentencesCacheArrayRef.current = speechSentencesCacheArray;
    }, [speechSentencesCacheArray]);

    const isNightModeRef = useRef(isNightMode);

    // isAvatarSpeaking boolean
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState<boolean>(false);

    // memoryKv
    const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
    const memoryKvRef = useRef(memoryKv);
    useEffect(() => {
      memoryKvRef.current = memoryKv;
    }, [memoryKv]);

    // sendTime DateTime
    const sendTimeRef = useRef(0);

    // lastTokenTime DateTime
    const lastTokenTimeRef = useRef(0);

    const isFirstTokenRef = useRef<boolean>(false);

    // firstTokenLatencyArray number[]
    const [firstTokenLatencyArray, setFirstTokenLatencyArray] = useState<
      number[]
    >([]);
    const firstTokenLatencyArrayRef = useRef(firstTokenLatencyArray);
    useEffect(() => {
      firstTokenLatencyArrayRef.current = firstTokenLatencyArray;
    }, [firstTokenLatencyArray]);

    // tokenLatencyArray number[]
    const [tokenLatencyArray, setTokenLatencyArray] = useState<number[]>([]);
    const tokenLatencyArrayRef = useRef(tokenLatencyArray);
    useEffect(() => {
      tokenLatencyArrayRef.current = tokenLatencyArray;
    }, [tokenLatencyArray]);

    const resetApp = () => {
      setAppKey((prevKey) => prevKey + 1);
    };

    const resetTokenLatency = () => {
      isFirstTokenRef.current = true;
      sendTimeRef.current = Date.now();
      lastTokenTimeRef.current = 0;
    };

    const recordTokenLatency = (delta: any) => {
      if (isFirstTokenRef.current) {
        isFirstTokenRef.current = false;
        lastTokenTimeRef.current = Date.now();
        const latency = Date.now() - sendTimeRef.current;
        if (latency > 0) {
          setFirstTokenLatencyArray((prevArray: number[]) => [
            ...prevArray,
            latency,
          ]);
        }
        lastTokenTimeRef.current = Date.now();
      } else {
        const latency = Date.now() - lastTokenTimeRef.current;
        lastTokenTimeRef.current = Date.now();
        if (latency > 0) {
          setTokenLatencyArray((prevArray: number[]) => [...prevArray, latency]);
        }
      }
    };

    // -------- functions ---------
    const camera_on_handler: Function = async ({
      on,
    }: {
      [on: string]: boolean;
    }) => {
      try {
        if (on) {
          if (cameraStatusRef.current === CAMERA_READY) {
            return {
              message: 'The camera is already on.',
            };
          }

          setCameraStatus(CAMERA_STARTING);
          return {
            message: 'The camera is starting, please wait a moment to turn on.',
          };
        }

        setCameraStatus(CAMERA_OFF);

        return { message: 'The camera has been turned off' };
      } catch (error) {
        console.error('camera error', error);
        return { error: error };
      }
    };

    const camera_current_handler: Function = async ({
      prompt = '',
    }: {
      [key: string]: string | undefined;
    }) => {
      try {
        if (prompt) {
          prompt = `User questions about these frames are: ${prompt}`;
        }

        console.log('prompt', prompt);

        if (photosRef.current && photosRef.current.length === 0) {
          console.log('no photos, please turn on your camera');
          return { error: 'no photos, please turn on your camera' };
        }

        let content: any = [
          {
            type: 'text',
            text: `Can you describe what you saw? ${prompt}. The top left corner of the image is the time, and usually you don't need to explain this time.`,
          },
        ];

        content.push({
          type: 'image_url',
          image_url: {
            url: photosRef.current[photosRef.current.length - 1],
            detail: 'high',
          },
        });

        const messages = [
          {
            role: 'user',
            content: content,
          },
        ];

        const resp = await getCompletion(messages);
        console.log('vision resp', resp);

        return { message: resp };
      } catch (error) {
        console.error('vision error', error);
        return { error: error };
      }
    };

    const camera_video_handler: Function = async ({
      prompt = '',
      seconds = CAMERA_PHOTO_LIMIT,
    }: {
      [key: string]: any;
    }) => {
      console.log('prompt', prompt);
      console.log('seconds', seconds);

      if (seconds && seconds > CAMERA_PHOTO_LIMIT) {
        return {
          error: `The maximum number of seconds is ${CAMERA_PHOTO_LIMIT}`,
        };
      }

      if (photosRef.current && photosRef.current.length === 0) {
        return { error: 'no photos, please turn on your camera' };
      }

      if (prompt) {
        prompt = `User questions about these frames are: ${prompt}`;
      }

      let content: any = [
        {
          type: 'text',
          text: `I'm going to give you a set of video frames from the video head capture, just captured. The images are displayed in reverse chronological order. Can you describe what you saw? If there are more pictures, it is continuous, please tell me the complete event that happened just now. ${prompt}`,
        },
      ];

      const lastTenPhotos = photosRef.current.slice(-seconds);
      // for photos
      lastTenPhotos.forEach((photo: string) => {
        content.push({
          type: 'image_url',
          image_url: {
            url: photo,
          },
        });
      });

      try {
        const messages = [
          {
            role: 'user',
            content: content,
          },
        ];

        const resp = await getCompletion(messages);
        console.log('vision resp', resp);

        return { message: resp };
      } catch (error) {
        console.error('vision error', error);

        return { error: error };
      }
    };

    const memory_handler: Function = async ({
      key,
      value,
    }: {
      [key: string]: any;
    }) => {
      setMemoryKv((memoryKv) => {
        const newKv = { ...memoryKv };
        newKv[key] = value;
        return newKv;
      });
      return { ok: true };
    };

    const avatar_handler: Function = async ({
      on,
    }: {
      [key: string]: boolean;
    }) => {
      if (on) {
        if (
          !profiles.currentProfile?.cogSvcSubKey ||
          !profiles.currentProfile?.cogSvcRegion
        ) {
          return {
            message:
              'Please set your Cognitive Services subscription key and region.',
          };
        }

        if (avatarStatusRef.current === AVATAR_READY) {
          return {
            message: 'The avatar is already on.',
          };
        }

        setAvatarStatus(AVATAR_STARTING);

        let checkTime = 0;

        while (checkTime < 25) {
          await delayFunction(1000);
          checkTime++;
          if (avatarStatusRef.current === AVATAR_READY) {
            return { message: 'ok' };
          }
        }

        setAvatarStatus(AVATAR_OFF);
        return { message: 'Error, please check your error message.' };
      }

      setAvatarStatus(AVATAR_OFF);

      return { message: 'done' };
    };

    const dark_handler: Function = ({ on }: { [on: string]: boolean }) => {
      setIsNightMode(on);
      return { ok: true };
    };

    const gptImagesDispatch = useGptImagesDispatch()!;
    const gptImagesRef = useGptImagesRef();
    const painting_handler: Function = async ({
      prompt,
      n = 1,
    }: {
      [key: string]: any;
    }) => {
      try {
        const resp = await getImages((prompt = prompt), (n = n));
        const image = resp.data[0];

        const gptImage: GptImage = {
          prompt: prompt,
          b64_json: image.b64_json,
        };

        gptImagesDispatch({ type: 'add', gptImage });
        console.log('painting', gptImage);
        console.log('gptImagesRef', gptImagesRef.current);

        return { result: 'completed, please check the results in the modal.' };
      } catch (error) {
        console.error('painting error', error);
        return { error: error };
      }
    };

    const image_modify_handler: Function = async ({
      prompt,
      index = 1,
    }: {
      [key: string]: any;
    }) => {
      if (!gptImagesRef.current) {
        return { error: 'no painting data, please generate painting first.' };
      }

      if (gptImagesRef.current.length === 0) {
        return { error: 'no painting data, please generate painting first.' };
      }

      const realIndex = index - 1;

      if (realIndex < 0 || realIndex >= gptImagesRef.current.length) {
        return { error: 'index out of images, please check the index.' };
      }

      const { b64_json } = gptImagesRef.current[realIndex];

      try {
        const resp = await editImages(prompt, b64_json);
        const image = resp.data[0];
        const gptImage: GptImage = {
          prompt: prompt,
          b64_json: image.b64_json,
        };

        gptImagesDispatch({ type: 'add', gptImage });
        console.log('painting', gptImage);
        return { result: 'completed, please check the results in the modal.' };
      } catch (error) {
        console.error('modify painting error', error);
        return { error: error };
      }
    };

    const [bingSearchData, setBingSearchData] = useState<any>(null);
    const bing_search_handler: Function = async ({
      query,
      count = 10,
      page = 1,
    }: {
      [key: string]: any;
    }) => {
      if (!profiles.currentProfile?.bingApiKey) {
        throw new Error('Bing API key is not set');
      }

      const offset = (page - 1) * count;
      const mkt = 'en-US';
      const params = { q: query, mkt: mkt, count: count, offset: offset };
      const headers = {
        'Ocp-Apim-Subscription-Key': profiles.currentProfile?.bingApiKey,
      };

      const response = await axios.get(
        'https://api.bing.microsoft.com/v7.0/search',
        { headers, params },
      );
      const data = response.data;

      setBingSearchData(data);

      console.log(data);

      return {
        message:
          "ok, please check the results in the modal. you don't need to say anything.",
        data: data,
      };
    };

    const camera_take_photo_handler: Function = async () => {
      // for first time, wait 2 seconds to make sure the camera is ready
      if (cameraStatusRef.current !== CAMERA_READY) {
        await delayFunction(4000);
      }

      if (cameraStatusRef.current !== CAMERA_READY) {
        return { error: 'camera is not ready, please turn on the camera first.' };
      }

      const currentPhoto = photosRef.current[photosRef.current.length - 1];
      const base64Data = currentPhoto.split(',')[1];
      const gptImage: GptImage = {
        prompt: 'take a photo',
        b64_json: base64Data,
      };
      gptImagesDispatch({ type: 'add', gptImage });
      return { message: 'ok' };
    };

    const opacity_handler: Function = async ({
      opacity,
    }: {
      [key: string]: any;
    }) => {
      console.log('opacity', opacity);
      // set opacity to float
      setOpacity(Number(opacity));
      return { message: 'ok' };
    };

    const background_handler: Function = () => {
      const backgroundImage = ['1', '2', '3', '4'];
      const randomIndex = Math.floor(Math.random() * backgroundImage.length);
      const randomBackground = backgroundImage[randomIndex];
      setBackground(randomBackground);
      return { message: `ok, the background image is ${randomBackground}.png` };
    };

    const debug_handler: Function = async ({
      debug_mode,
    }: {
      [key: string]: any;
    }) => {
      setIsDebugMode(debug_mode);
      return { ok: true };
    };

    const set_disconnection_handler: Function = () => {
      resetApp();
      return { ok: true };
    };

    const azure_docs_definition = {
      ...azure_docs.definition,
      description: azure_docs.definition.description.replace(
        '{rag}',
        profiles.currentProfile?.graphragAbout || GRAPHRAG_ABOUT,
      ),
    };

    const builtinFunctionTools: [ToolDefinitionType, Function][] = [
      [camera_on.definition, camera_on_handler],
      [camera_take_photo.definition, camera_take_photo_handler],
      [opacity.definition, opacity_handler],
      [background.definition, background_handler],
      [camera_current.definition, camera_current_handler],
      [camera_video.definition, camera_video_handler],
      [memory.definition, memory_handler],
      [avatar.definition, avatar_handler],
      [dark.definition, dark_handler],
      [bing.definition, bing_search_handler],
      [painting.definition, painting_handler],
      [image_modify.definition, image_modify_handler],
      [debug_model.definition, debug_handler],
      [set_disconnection.definition, set_disconnection_handler],
      [news.definition, news.handler],
      [weather.definition, weather.handler],
      [order_get.definition, order_get.handler],
      [order_return.definition, order_return.handler],
      [exchange_rate_aim.definition, exchange_rate_aim.handler],
      [exchange_rate_list.definition, exchange_rate_list.handler],
      [exchange_rate_configs.definition, exchange_rate_configs.handler],
      [products_recommend.definition, products_recommend.handler],
      [location.definition, location.handler],
      [feishu.definition, feishu.handler],
      [open_url.definition, open_url.handler],
      [azure_docs_definition, azure_docs.handler],
      [demo.definition, demo.handler],
      [quote.definition, quote.handler],
      [stock_recommend.definition, stock_recommend.handler],
      [devices_action.definition, devices_action.handler],
    ];
    builtinFunctionTools.sort((a, b) => a[0].name.localeCompare(b[0].name));

    let merge_tools: [ToolDefinitionType, Function][] = profiles.currentProfile
      ?.buildInFunctions
      ? [...loadFunctionsTools, ...builtinFunctionTools]
      : [...loadFunctionsTools];

    // resort merge_tools by ToolDefinitionType name
    merge_tools.sort((a, b) => a[0].name.localeCompare(b[0].name));

    const functions_tool: [ToolDefinitionType, Function][] = merge_tools;

    // functions_tools array
    const functionsToolsRef =
      useRef<[ToolDefinitionType, Function][]>(functions_tool);

    let updateInstructions = profiles.currentProfile?.buildInPrompt
      ? SYSTEM_INSTRUCTIONS
      : profiles.currentProfile?.prompt || '';

    // if (enableFunctionCalling() && functionsToolsRef.current.length > 0) {
    //   updateInstructions += `\n\nYou have the following tools and abilities:`;
    //   for (const tool of functionsToolsRef.current) {
    //     updateInstructions += `\n${tool[0].name}: ${tool[0].description}`;
    //   }
    // }

    const [messages, setMessages] = useState<any[]>([]);

    const [llmInstructions, setLlmInstructions] =
      useState<string>(updateInstructions);
    const llmInstructionsRef = useRef(llmInstructions);

    useEffect(() => {
      llmInstructionsRef.current = llmInstructions;

      if (assistant) {
        assistant.instructions = llmInstructions;
        (async () => {
          try {
            const res = await getOpenAIClient().beta.assistants.update(
              assistant.id,
              {
                instructions: llmInstructions,
              },
            );
            console.log('assistant instructions updated', res);
          } catch (error) {
            console.error('Error:', error);
          }
        })();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [llmInstructions]);

    const replaceInstructions = (source: string | RegExp, target: string) => {
      const new_instructions = llmInstructionsRef.current.replace(source, target);
      setLlmInstructions(new_instructions);
      return new_instructions;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.altKey &&
        (event.key === 'p' || event.key === 'P')
      ) {
        event.preventDefault();
        setDebug((prevMyVariable) => {
          return !prevMyVariable;
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
      <AppContext.Provider
        value={{
          isOnline,
          photos,
          photosRef,
          setPhotos,
          loading,
          setLoading,
          debug,
          debugRef,
          setDebug,
          assistant,
          assistantRef,
          setAssistant,
          thread,
          threadRef,
          setThread,
          threadJob,
          threadJobRef,
          setThreadJob,
          responseBuffer,
          responseBufferRef,
          setResponseBuffer,
          speechSentencesCacheArray,
          speechSentencesCacheArrayRef,
          setSpeechSentencesCacheArray,
          llmInstructions,
          llmInstructionsRef,
          replaceInstructions,
          isNightMode,
          isNightModeRef,
          setIsNightMode,
          isAvatarSpeaking,
          setIsAvatarSpeaking,
          memoryKv,
          memoryKvRef,
          setMemoryKv,
          inputValue,
          inputValueRef,
          setInputValue,
          needSpeechQueue,
          needSpeechQueueRef,
          setNeedSpeechQueue,
          caption,
          captionRef,
          setCaption,
          captionQueue,
          captionQueueRef,
          setCaptionQueue,
          updateCaptionQueue,
          addCaptionQueue,
          bingSearchData,
          setBingSearchData,
          cameraStatus,
          cameraStatusRef,
          setCameraStatus,
          connectStatus,
          connectStatusRef,
          setConnectStatus,
          avatarStatus,
          avatarStatusRef,
          setAvatarStatus,
          isFirstTokenRef,
          firstTokenLatencyArray,
          firstTokenLatencyArrayRef,
          setFirstTokenLatencyArray,
          tokenLatencyArray,
          tokenLatencyArrayRef,
          setTokenLatencyArray,
          recordTokenLatency,
          resetTokenLatency,
          sendTimeRef,
          lastTokenTimeRef,
          functionsToolsRef,
          connectMessage,
          setConnectMessage,
          resetApp,
          isDebugMode,
          isDebugModeRef,
          setIsDebugMode,
          vectorStore,
          vectorStoreRef,
          setVectorStore,
          inputTokens,
          inputTokensRef,
          setInputTokens,
          outputTokens,
          outputTokensRef,
          setOutputTokens,
          inputTextTokens,
          inputTextTokensRef,
          setInputTextTokens,
          outputTextTokens,
          outputTextTokensRef,
          setOutputTextTokens,
          inputAudioTokens,
          inputAudioTokensRef,
          setInputAudioTokens,
          outputAudioTokens,
          outputAudioTokensRef,
          setOutputAudioTokens,
          appKey,
          loadFunctionsTools,
          builtinFunctionTools,
          messages,
          setMessages,
        }}
      >
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
