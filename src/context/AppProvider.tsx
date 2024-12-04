import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { instructions } from '../utils/instructions';

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
}

const IS_DEBUG: boolean = window.location.href.includes('localhost');

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

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
  }, [isAvatarStarted]);

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
      thread, threadRef, setThread,
      threadJob, threadJobRef, setThreadJob,
      assistantResponseBuffer, assistantResponseBufferRef, setAssistantResponseBuffer,
      avatarSpeechSentencesArray, avatarSpeechSentencesArrayRef, setAvatarSpeechSentencesArray,
      realtimeInstructions, realtimeInstructionsRef, setRealtimeInstructions, replaceInstructions
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
