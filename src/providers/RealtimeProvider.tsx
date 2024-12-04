import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useContexts } from './AppProvider';
import { htmlEncodeAvatar } from '../lib/helper';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';

interface RealtimeContextType {

  stopRecording: () => Promise<void>;
  changeTurnEndType: (value: string) => Promise<void>;

  wavRecorderRef: React.MutableRefObject<WavRecorder>;
  wavStreamPlayerRef: React.MutableRefObject<WavStreamPlayer>;
  
  isRecording: boolean;
  isConnected: boolean;
  isConnecting: boolean;

  isRecordingRef: React.MutableRefObject<boolean>;
  isConnectedRef: React.MutableRefObject<boolean>;
  isConnectingRef: React.MutableRefObject<boolean>;
  

  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>;

  deleteConversationItem: (id: string) => Promise<void>;
  cancleRealtimeResponse: () => Promise<void>;
  startRecording: () => Promise<void>;

  connectMessage: string;
  connectMessageRef: React.MutableRefObject<string>;
  setConnectMessage: React.Dispatch<React.SetStateAction<string>>;

  canPushToTalk: boolean;
  canPushToTalkRef: React.MutableRefObject<boolean>;
  setCanPushToTalk: React.Dispatch<React.SetStateAction<boolean>>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { realtimeClientRef } = useContexts();

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

  // isRecording boolean
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // isConnected boolean
  const [isConnected, setIsConnected] = useState(false);
  const isConnectedRef = useRef(false);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // isConnecting boolean
  const [isConnecting, setIsConnecting] = useState(false);
  const isConnectingRef = useRef(false);
  useEffect(() => {
    isConnectingRef.current = isConnecting;
  }, [isConnecting]);

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

  const cancleRealtimeResponse = async () => {
    const client = realtimeClientRef.current;
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
    const client = realtimeClientRef.current;
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
      const client = realtimeClientRef.current;
      const wavRecorder = wavRecorderRef.current;
      setIsRecording(false);
      await wavRecorder.pause();
      client.createResponse();
    } catch (e) {
      setIsConnecting(false);
      setIsConnected(false);
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
      setIsConnecting(false);
      setIsConnected(false);
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
      isConnected,
      isConnecting,
      isRecordingRef,
      isConnectedRef,
      isConnectingRef,
      setIsRecording,
      setIsConnected,
      setIsConnecting,
      deleteConversationItem,
      cancleRealtimeResponse,
      startRecording,
      connectMessage,
      connectMessageRef,
      setConnectMessage,
      canPushToTalk,
      canPushToTalkRef,
      setCanPushToTalk,
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
