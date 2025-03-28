import React, { useState } from 'react';
import { CONNECT_CONNECTED } from '../lib/const';
import { Button } from '../components/button/Button';
import { Mic } from 'react-feather';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';

const PushToTalk: React.FC<{
  connectStatus: string;
  canPushToTalk: boolean;
  realtimeClient: RealtimeClient;
  wavRecorderRef: WavRecorder;
  wavStreamPlayerRef: WavStreamPlayer;
}> = ({
  connectStatus,
  canPushToTalk,
  realtimeClient,
  wavRecorderRef,
  wavStreamPlayerRef,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  if (connectStatus !== CONNECT_CONNECTED) {
    return null;
  }

  if (!canPushToTalk) {
    return null;
  }

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const trackSampleOffset = wavStreamPlayerRef.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      realtimeClient.cancelResponse(trackId, offset);
    }
    await wavRecorderRef.record((data) =>
      realtimeClient.appendInputAudio(data.mono),
    );
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);
    await wavRecorderRef.pause();
    realtimeClient.createResponse();
  };

  return (
    <>
      <div className="content-actions">
        <Button
          label={isRecording ? 'Release to send' : 'Push to talk'}
          icon={Mic}
          className={'container_bg'}
          buttonStyle={isRecording ? 'alert' : 'regular'}
          style={
            isRecording ? { backgroundColor: '#80cc29', color: '#ffffff' } : {}
          }
          disabled={connectStatus !== CONNECT_CONNECTED || !canPushToTalk}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        />
      </div>
    </>
  );
};

export default PushToTalk;
