import { useState } from 'react';


import { Mic, MicOff, Send, StopCircle, Clock } from 'react-feather';


import { AssistantStream } from 'openai/lib/AssistantStream';
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from 'openai/resources/beta/assistants/assistants';
import { getOpenAIClient } from '../lib/openai';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { useRealtime } from '../providers/RealtimeProvider';
import { useContexts } from '../providers/AppProvider';
import { useAvatar } from '../providers/AvatarProvider';
import { useAssistant } from '../providers/AssistantProvider';
import { useStt } from '../providers/SttProvider';
import { useSettings } from '../providers/SettingsProvider';




export function InputBar() {

 const { isRealtime } = useSettings();
 const { isConnectedRef } = useRealtime();
 const { inputValueRef, setInputValue, realtimeClientRef } = useContexts();
 const { cancleRealtimeResponse } = useRealtime();
 const { stopAvatarSpeaking } = useAvatar();
 const { setAssistantRunning, stopCurrentStreamJob, assistantRunningRef } = useAssistant();
 const { sttRecognizerRef, sttRecognizerConnectingRef, sttStartRecognition, sttStopRecognition } = useStt();


 const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    stopAvatarSpeaking();
    cancleRealtimeResponse();
    realtimeClientRef.current.sendUserMessageContent([
      {
        type: `input_text`,
        text: inputValue
      }
    ]);
    setInputValue('');
    console.log('send text', inputValue);
  };


  return (
    <>
     {
        isConnectedRef.current && (

          <div className="text-input">
            <input type="text"
              placeholder="Type your message here..."
              value={inputValueRef.current}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendText(inputValueRef.current);
                }
                if (e.key === 'Escape') {
                  setInputValue('');
                }
              }} onChange={(e) => setInputValue(e.target.value)} />

            <button onClick={() => sendText(inputValueRef.current)}
              style={{ display: inputValueRef.current ? '' : 'none' }}
              disabled={!inputValueRef.current}><Send /></button>


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
                display: assistantRunningRef.current ? '' : 'none'
              }}
            >
              <StopCircle />
            </button>

            <button
              onClick={sttRecognizerRef.current ? sttStopRecognition : sttStartRecognition}
              style={{
                padding: '5px 8px',
                fontSize: '12px',
                color: sttRecognizerRef.current ? '#ffffff' : '',
                backgroundColor: sttRecognizerRef.current ? '#ff4d4f' : '',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
                display: isRealtime ? 'none' : ''
              }}
            >
              {sttRecognizerRef.current ? <Mic /> : (
                sttRecognizerConnectingRef.current ? <Clock /> : <MicOff />
              )}
            </button>

          </div>
        )
      }
    </>
  )
   
  ;
}
