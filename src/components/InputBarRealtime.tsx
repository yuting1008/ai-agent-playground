import { Send } from 'react-feather';

import { useContexts } from '../providers/AppProvider';
import './InputBar.scss';
import { CONNECT_CONNECTED } from '../lib/const';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { WavStreamPlayer } from '../lib/wavtools';
import { RecommandText } from './RecommandText';

export function InputBarRealtime({
  wavStreamPlayer,
  realtimeClient,
}: {
  wavStreamPlayer: WavStreamPlayer;
  realtimeClient: RealtimeClient;
}) {
  const { setInputValue, setResponseBuffer, inputValue, connectStatus } =
    useContexts();

  const cancelRealtimeResponse = async () => {
    const trackSampleOffset = wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      realtimeClient.cancelResponse(trackId, offset);
    }
  };

  const { resetTokenLatency } = useContexts();

  const sendText = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setResponseBuffer('');

    resetTokenLatency();

    cancelRealtimeResponse();
    realtimeClient.sendUserMessageContent([
      {
        type: `input_text`,
        text: inputValue,
      },
    ]);
    setInputValue('');
    console.log('send text', inputValue);
    return;
  };

  return (
    <>
      {connectStatus === CONNECT_CONNECTED && (
        <div>
          <RecommandText
            handleInputButtonClick={sendText}
            messages={[
              'open camera',
              'what is the weather in tokyo?',
              'open avatar',
            ]}
          />
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
          </div>
        </div>
      )}
    </>
  );
}
