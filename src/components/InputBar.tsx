import { Clock, Mic, MicOff, Send, StopCircle } from 'react-feather';

import { useRealtime } from '../providers/RealtimeProvider';
import { useContexts } from '../providers/AppProvider';
import { useAssistant } from '../providers/AssistantProvider';
import { useSettings } from '../providers/SettingsProvider';
import { useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import './InputBar.scss';

export function InputBar() {

  const {
    setInputValue, setIsAvatarSpeaking,
    setAssistantResponseBuffer, inputValue, realtimeClientRef
  } = useContexts();

  const {
    cogSvcSubKeyRef, cogSvcRegionRef,
    isRealtime
  } = useSettings();


  const {
    setMessagesAssistant, setAssistantRunning, sendAssistantMessage,
    stopCurrentStreamJob, assistantRunning
  } = useAssistant();


  const {
    isConnected, cancelRealtimeResponse
  } = useRealtime();


  const [sttRecognizer, setSttRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);
  const [sttRecognizerConnecting, setSttRecognizerConnecting] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const sttStartRecognition = () => {

    setSttRecognizerConnecting(true);

    const autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(['zh-CN', 'en-US']);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKeyRef.current, cogSvcRegionRef.current);
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = SpeechSDK.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig);

    recognizer.recognizing = (s, e) => {
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
      }
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


  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setAssistantResponseBuffer('');

    if (isRealtime) {
      cancelRealtimeResponse();
      realtimeClientRef?.current.sendUserMessageContent([
        {
          type: `input_text`,
          text: inputValue
        }
      ]);
      setInputValue('');
      console.log('send text', inputValue);
      return;
    }

    await stopCurrentStreamJob();
    setIsAvatarSpeaking(false);
    sendAssistantMessage(inputValue);
    setMessagesAssistant((prevMessages: any) => [
      ...prevMessages,
      { role: 'user', text: inputValue }
    ]);
    setAssistantRunning(true);
    setInputValue('');
  };


  return (
    <>
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
                   }}
                   onChange={(e) => setInputValue(e.target.value)}
            />

            <button
              onClick={() => sendText(inputValue)}
              style={{ display: inputValue ? '' : 'none' }}
              disabled={!inputValue}>
              <Send />
            </button>


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
              className={`mic-button ${isRecognizing ? 'active' : ''}`}
              style={{
                color: sttRecognizer ? '#ffffff' : '',
                backgroundColor: sttRecognizer ? '#ff4d4f' : '',
                display: isRealtime ? 'none' : ''
              }}
            >
              {sttRecognizer ? <Mic /> :
                (
                  sttRecognizerConnecting ? <Clock /> : <MicOff />
                )}
            </button>

          </div>
        )
      }
    </>
  )

    ;
}
