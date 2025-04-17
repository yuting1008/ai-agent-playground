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
              'Please introduce Microsoft',
              'Xin giới thiệu Microsoft',
              'マイクロソフトを紹介してください',
              'Microsoft를 소개해 주세요',
              'open camera',
              '請幫我拍照',
              '請問你看到什麼?',
              '請幫我畫一張海邊的圖畫',
              '幫我搜尋越南有什麼好玩的',
              '請給我這份文件的總結',
              'what is the weather in tokyo?',              
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
