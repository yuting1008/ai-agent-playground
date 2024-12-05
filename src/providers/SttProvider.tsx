import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useSettings } from './SettingsProvider';
import { useContexts } from './AppProvider';
import { useAvatar } from './AvatarProvider';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { useAssistant } from './AssistantProvider';

interface SttContextType {
  sttRecognizer: SpeechSDK.SpeechRecognizer | null;
  sttRecognizerRef: React.MutableRefObject<SpeechSDK.SpeechRecognizer | null>;
  setSttRecognizer: React.Dispatch<React.SetStateAction<SpeechSDK.SpeechRecognizer | null>>;

  sttRecognizerConnecting: boolean;
  sttRecognizerConnectingRef: React.MutableRefObject<boolean>;
  setSttRecognizerConnecting: React.Dispatch<React.SetStateAction<boolean>>;

  sttStartRecognition: () => void;
  sttStopRecognition: () => void;
}

const SttContext = createContext<SttContextType | undefined>(undefined);

export const SttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const { setInputValue,setAvatarSpeechSentencesArray} = useContexts();
  const { cogSvcSubKeyRef,cogSvcRegionRef } = useSettings();
  const { stopAvatarSpeaking } = useAvatar();
  const { stopCurrentStreamJob } = useAssistant();
  const {  setMessagesAssistant, setAssistantRunning,sendAssistantMessage } = useAssistant();
  const {setAssistantResponseBuffer} = useContexts();

  // ------------------------ vars ------------------------
  // sttRecognizer SpeechRecognizer
  const [sttRecognizer, setSttRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);
  const sttRecognizerRef = useRef(sttRecognizer);
  useEffect(() => {
    sttRecognizerRef.current = sttRecognizer;
  }, [sttRecognizer]);

  // sttRecognizerConnecting boolean
  const [sttRecognizerConnecting, setSttRecognizerConnecting] = useState(false);
  const sttRecognizerConnectingRef = useRef(sttRecognizerConnecting);
  useEffect(() => {
    sttRecognizerConnectingRef.current = sttRecognizerConnecting;
  }, [sttRecognizerConnecting]);
  
  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    setAvatarSpeechSentencesArray([]);
    await stopCurrentStreamJob();
    setAssistantResponseBuffer('')
    stopAvatarSpeaking();
    sendAssistantMessage(inputValue);
    setMessagesAssistant((prevMessages: any) => [
      ...prevMessages,
      { role: 'user', text: inputValue }
    ]);
    setAssistantRunning(true);
    setInputValue('');
  };


  // ------------------------ functions ------------------------

  const sttStartRecognition = () => {

    setSttRecognizerConnecting(true);

    const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(['zh-CN', 'en-US']);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKeyRef.current, cogSvcRegionRef.current);
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
    // newRecognizer.speechEndDetected = () => {
    //   console.log('Silence detected. Stopping recognition.');
    //   sttStopRecognition();
    // };

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
    if (sttRecognizerRef.current) {
      sttRecognizerRef.current.stopContinuousRecognitionAsync(() => {
        console.log('Recognition stopped.');
        setSttRecognizer(null);
        setSttRecognizerConnecting(false);
      });
    }

    setInputValue('');
  };

  // ------------------------ return ------------------------
  return (
    <SttContext.Provider value={{
      sttRecognizer, sttRecognizerRef, setSttRecognizer,
      sttRecognizerConnecting, sttRecognizerConnectingRef, setSttRecognizerConnecting,
      sttStartRecognition, sttStopRecognition,
    }}>
      {children}
    </SttContext.Provider>
  );
};


export const useStt = () => {
  const context = useContext(SttContext);
  if (!context) {
    throw new Error('useStt must be used within a SttProvider');
  }
  return context;
};
