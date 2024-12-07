import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useContexts } from './AppProvider';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';
import { ItemType } from '@theodoreniu/realtime-api-beta/dist/lib/client.js';
import { CONNECT_DISCONNECTED } from '../lib/const';

interface RealtimeContextType {

  stopRecording: () => Promise<void>;
  changeTurnEndType: (value: string) => Promise<void>;

  wavRecorderRef: React.MutableRefObject<WavRecorder>;
  wavStreamPlayerRef: React.MutableRefObject<WavStreamPlayer>;
  
  isRecording: boolean;
  isRecordingRef: React.MutableRefObject<boolean>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;

  deleteConversationItem: (id: string) => Promise<void>;
  cancelRealtimeResponse: () => Promise<void>;
  startRecording: () => Promise<void>;

  connectMessage: string;
  connectMessageRef: React.MutableRefObject<string>;
  setConnectMessage: React.Dispatch<React.SetStateAction<string>>;

  canPushToTalk: boolean;
  canPushToTalkRef: React.MutableRefObject<boolean>;
  setCanPushToTalk: React.Dispatch<React.SetStateAction<boolean>>;

  items: ItemType[];
  itemsRef: React.MutableRefObject<ItemType[]>;
  setItems: React.Dispatch<React.SetStateAction<ItemType[]>>;

  realtimeEvents: RealtimeEvent[];
  realtimeEventsRef: React.MutableRefObject<RealtimeEvent[]>;
  setRealtimeEvents: React.Dispatch<React.SetStateAction<RealtimeEvent[]>>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}


export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const { 
    realtimeClientRef,
    setConnectStatus,
   } = useContexts();

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
  
  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const itemsRef = useRef<ItemType[]>([]);
  useEffect(() => {
    itemsRef.current = items;

    // Auto-scroll the conversation logs
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }

  }, [items]);

  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const realtimeEventsRef = useRef<RealtimeEvent[]>([]);
  useEffect(() => {
    realtimeEventsRef.current = realtimeEvents;
  }, [realtimeEvents]);

  // isRecording boolean
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // connectMessage string
  const [connectMessage, setConnectMessage] = useState('Awaiting Connection...');
  const connectMessageRef = useRef('Awaiting Connection...');
  useEffect(() => {
    connectMessageRef.current = connectMessage;
  }, [connectMessage]);

  // canPushToTalk boolean
  const [canPushToTalk, setCanPushToTalk] = useState(true);
  const canPushToTalkRef = useRef(true);
  useEffect(() => {
    canPushToTalkRef.current = canPushToTalk;
  }, [canPushToTalk]);


  const deleteConversationItem = useCallback(async (id: string) => {
    const client = realtimeClientRef.current;
    client.deleteItem(id);
  }, []);

  const cancelRealtimeResponse = async () => {
    const client = realtimeClientRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      client.cancelResponse(trackId, offset);
    }
  };

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const client = realtimeClientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };


  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    try {
      const client = realtimeClientRef.current;
      const wavRecorder = wavRecorderRef.current;
      setIsRecording(false);
      await wavRecorder.pause();
      client.createResponse();
    } catch (e) {
      setConnectStatus(CONNECT_DISCONNECTED);
      setConnectMessage('Connection Failed. \nPlease check your network and reconnect.');
      realtimeClientRef.current.disconnect();
      console.error(e);
    }
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = realtimeClientRef.current;
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
      setConnectStatus(CONNECT_DISCONNECTED);
      setConnectMessage('Connection Failed. \nPlease check your network and reconnect.');
      client.disconnect();
      console.error(e);
    }

  };

  return (
    <RealtimeContext.Provider value={{
      stopRecording,
      changeTurnEndType,
      wavRecorderRef,
      wavStreamPlayerRef,
      isRecording,
      isRecordingRef,
      setIsRecording,
      deleteConversationItem,
      cancelRealtimeResponse,
      startRecording,
      connectMessage,
      connectMessageRef,
      setConnectMessage,
      canPushToTalk,
      canPushToTalkRef,
      setCanPushToTalk,
      items,
      itemsRef,
      setItems,
      realtimeEvents,
      realtimeEventsRef,
      setRealtimeEvents,
    }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
