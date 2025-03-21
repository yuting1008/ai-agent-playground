import { Clock, Mic, MicOff, Send, StopCircle } from 'react-feather';

import { useContexts } from '../providers/AppProvider';
import { useEffect, useRef, useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import './InputBar.scss';
import {
  ASSISTANT_TYPE_ASSISTANT,
  ASSISTANT_TYPE_DEFAULT,
  clientHiChinese,
  clientHiEnglish,
  CONNECT_CONNECTED,
} from '../lib/const';
import { Profiles } from '../lib/Profiles';
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

  const profiles = new Profiles();
  const profile = profiles.currentProfile;

  const cogSvcSubKey = profile?.cogSvcSubKey || '';
  const cogSvcRegion = profile?.cogSvcRegion || 'westus2';
  const cogSvcEndpoint = profile?.cogSvcEndpoint || '';

  const [sttRecognizer, setSttRecognizer] =
    useState<SpeechSDK.SpeechRecognizer | null>(null);
  const [sttRecognizerConnecting, setSttRecognizerConnecting] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const [error, setError] = useState(false);
  const errorRef = useRef(false);
  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const sttStartRecognition = () => {
    setError(false);

    console.log('Starting recognition.');

    setSttRecognizerConnecting(true);

    const autoDetectSourceLanguageConfig =
      SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages([
        'zh-CN',
        'en-US',
      ]);

    const speechConfig = SpeechSDK.SpeechConfig.fromEndpoint(
      new URL(
        cogSvcEndpoint
          ? cogSvcEndpoint
          : `https://${cogSvcRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
      ),
      cogSvcSubKey,
    );

    speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = SpeechSDK.SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig,
    );

    recognizer.recognizing = (s, e) => {
      if (!profile?.isAssistant) {
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
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        console.log(`Final result: ${e.result.text}`);
        if (profile?.isAssistant) {
          (async () => {
            await stopCurrentStreamJob();
          })();
        }
        setInputValue(e.result.text);
        setIsRecognizing(false);
        sendText(e.result.text);
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        console.log('No speech recognized.');
        setIsRecognizing(false);
      }
    };

    recognizer.speechEndDetected = () => {
      console.log('Silence detected. Stopping recognition.');
    };

    recognizer.canceled = (s, e) => {
      console.error(`Canceled: ${e.reason}`);
      setError(true);
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = () => {
      console.log('Session stopped.');
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync(
      () => {
        if (errorRef.current) {
          setSttRecognizer(null);
          setSttRecognizerConnecting(false);
          alert(
            'Failed to connect to speech service. Please check your configuration and try again.',
          );
          return;
        }
        console.log(recognizer);
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
    console.log('Stopping recognition.');

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
    setAssistantRunning(true);
    setMessagesAssistant((prevMessages: any) => [
      ...prevMessages,
      { role: 'user', text: inputValue },
    ]);
    sendAssistantMessage(inputValue);
    setInputValue('');
  };

  useEffect(() => {
    if (connectStatus === CONNECT_CONNECTED) {
      const hi = clientHiEnglish;
      sendText(hi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectStatus]);

  return (
    <>
      {connectStatus === CONNECT_CONNECTED && (
        <div className="text-input">
          <input
            type="text"
            placeholder={
              assistantRunning
                ? 'Waiting Response...'
                : 'Type your message here...'
            }
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
            disabled={assistantRunning}
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
