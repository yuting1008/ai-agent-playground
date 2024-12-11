import { Clock, Mic, MicOff, Send, StopCircle } from 'react-feather';

import { useContexts } from '../providers/AppProvider';
import { useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import './InputBar.scss';
import {
  ASSISTENT_TYPE_ASSISTANT,
  ASSISTENT_TYPE_DEFAULT,
  CONNECT_CONNECTED,
} from '../lib/const';

export function InputBarAssistant({
  setMessagesAssistant,
  setAssistantRunning,
  sendAssistantMessage,
  stopCurrentStreamJob,
  assistantRunning,
}: {
  setMessagesAssistant: (messages: any) => void;
  setAssistantRunning: (assistantRunning: boolean) => void;
  sendAssistantMessage: (message: string) => void;
  stopCurrentStreamJob: () => void;
  assistantRunning: boolean;
}) {
  const {
    setInputValue,
    setIsAvatarSpeaking,
    setResponseBuffer,
    inputValue,
    connectStatus,
  } = useContexts();

  const cogSvcSubKey = localStorage.getItem('cogSvcSubKey') || '';
  const cogSvcRegion = localStorage.getItem('cogSvcRegion') || 'westus2';

  const [sttRecognizer, setSttRecognizer] =
    useState<SpeechSDK.SpeechRecognizer | null>(null);
  const [sttRecognizerConnecting, setSttRecognizerConnecting] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const assistantType =
    localStorage.getItem('assistantType') || ASSISTENT_TYPE_DEFAULT;
  const isAssistant = assistantType === ASSISTENT_TYPE_ASSISTANT;

  const sttStartRecognition = () => {
    setSttRecognizerConnecting(true);

    const autoDetectSourceLanguageConfig =
      SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages([
        'zh-CN',
        'en-US',
      ]);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      cogSvcSubKey,
      cogSvcRegion,
    );
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = SpeechSDK.SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig,
    );

    recognizer.recognizing = (s, e) => {
      if (!isAssistant) {
        return;
      }
      console.log(`Recognizing: ${e.result.text}`);
      setInputValue(e.result.text);
      setIsRecognizing(true);

      (async () => {
        await stopCurrentStreamJob();
      })();

      setIsAvatarSpeaking(false);
    };

    recognizer.recognized = (s, e) => {
      if (!isAssistant) {
        return;
      }
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        console.log(`Final result: ${e.result.text}`);
        setInputValue(e.result.text);
        setIsRecognizing(false);
        sendText(e.result.text);
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        console.log('No speech recognized.');
        setIsRecognizing(false);
      }
    };

    // Speech Ended / Silence
    // newRecognizer.speechEndDetected = () => {
    //   console.log('Silence detected. Stopping recognition.');
    //   sttStopRecognition();
    // };

    recognizer.canceled = (s, e) => {
      console.error(`Canceled: ${e.reason}`);
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = () => {
      console.log('Session stopped.');
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {
        console.log('Recognition started.');
        setSttRecognizer(recognizer);
        setSttRecognizerConnecting(false);
      },
      (err) => {
        console.error('Error starting recognition:', err);
        setSttRecognizerConnecting(false);
      },
    );
  };

  const sttStopRecognition = () => {
    if (sttRecognizer) {
      sttRecognizer.stopContinuousRecognitionAsync(() => {
        console.log('Recognition stopped.');
        setSttRecognizer(null);
        setSttRecognizerConnecting(false);
      });
    }

    setInputValue('');
  };

  const { resetTokenLatency } = useContexts();

  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setResponseBuffer('');

    resetTokenLatency();

    await stopCurrentStreamJob();
    setIsAvatarSpeaking(false);
    sendAssistantMessage(inputValue);
    setMessagesAssistant((prevMessages: any) => [
      ...prevMessages,
      { role: 'user', text: inputValue },
    ]);
    setAssistantRunning(true);
    setInputValue('');
  };

  return (
    <>
      {connectStatus === CONNECT_CONNECTED && (
        <div className="text-input">
          <input
            type="text"
            placeholder="Type your message here..."
            value={inputValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendText(inputValue);
              }
              if (e.key === 'Escape') {
                setInputValue('');
              }
            }}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <button
            onClick={() => sendText(inputValue)}
            style={{ display: inputValue ? '' : 'none' }}
            disabled={!inputValue}
          >
            <Send />
          </button>

          <button
            onClick={() => {
              setAssistantRunning(false);
              (async () => {
                await stopCurrentStreamJob();
              })();
            }}
            style={{
              padding: '5px 5px',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
              display: assistantRunning ? '' : 'none',
            }}
          >
            <StopCircle />
          </button>

          <button
            onClick={sttRecognizer ? sttStopRecognition : sttStartRecognition}
            className={`mic-button ${isRecognizing ? 'active' : ''}`}
            style={{
              color: sttRecognizer ? '#ffffff' : '',
              backgroundColor: sttRecognizer ? '#ff4d4f' : '',
            }}
          >
            {sttRecognizer ? (
              <Mic />
            ) : sttRecognizerConnecting ? (
              <Clock />
            ) : (
              <MicOff />
            )}
          </button>
        </div>
      )}
    </>
  );
}
