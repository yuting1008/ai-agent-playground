

import { Mic, MicOff, Send, StopCircle, Clock } from 'react-feather';


import { useRealtime } from '../providers/RealtimeProvider';
import { useContexts } from '../providers/AppProvider';
import { useAvatar } from '../providers/AvatarProvider';
import { useAssistant } from '../providers/AssistantProvider';
import { useStt } from '../providers/SttProvider';
import { useSettings } from '../providers/SettingsProvider';


export function InputBar() {

  const { isRealtime } = useSettings();
  const { isConnected } = useRealtime();
  const { inputValue, setInputValue, realtimeClientRef } = useContexts();
  const { cancelRealtimeResponse } = useRealtime();
  const { stopAvatarSpeaking } = useAvatar();
  const {  stopCurrentStreamJob, assistantRunning } = useAssistant();
  const { sttRecognizerRef, sttRecognizerConnecting, sttStartRecognition, sttStopRecognition } = useStt();
  const {setAssistantResponseBuffer} = useContexts();
  const {  setMessagesAssistant, setAssistantRunning,sendAssistantMessage } = useAssistant();

  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    stopAvatarSpeaking();

    if (isRealtime){
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
              {sttRecognizerRef.current ? <Mic /> :
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
