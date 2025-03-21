import React, { useState } from 'react';
import { CONNECT_CONNECTED } from '../lib/const';
import { Toggle } from '../components/toggle/Toggle';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';
import PushToTalk from './PushToTalk';

const TurnEndType: React.FC<{
  connectStatus: string;
  realtimeClient: RealtimeClient;
  wavRecorderRef: WavRecorder;
  wavStreamPlayerRef: WavStreamPlayer;
}> = ({
  connectStatus,
  realtimeClient,
  wavRecorderRef,
  wavStreamPlayerRef,
}) => {
  const [canPushToTalk, setCanPushToTalk] = useState(true);

  if (connectStatus !== CONNECT_CONNECTED) {
    return null;
  }

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    if (value === 'none' && wavRecorderRef.getStatus() === 'recording') {
      await wavRecorderRef.pause();
    }

    realtimeClient.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });

    if (value === 'server_vad') {
      await wavRecorderRef.record((data) => {
        if (realtimeClient.isConnected()) {
          realtimeClient.appendInputAudio(data.mono);
        }
      });
    }

    setCanPushToTalk(value === 'none');
  };

  return (
    <>
      <div className="content-actions container_bg">
        <Toggle
          defaultValue={false}
          labels={['Manual', 'VAD']}
          values={['none', 'server_vad']}
          onChange={(_, value) => changeTurnEndType(value)}
        />
      </div>

      <PushToTalk
        connectStatus={connectStatus}
        canPushToTalk={canPushToTalk}
        realtimeClient={realtimeClient}
        wavRecorderRef={wavRecorderRef}
        wavStreamPlayerRef={wavStreamPlayerRef}
      />
    </>
  );
};

export default TurnEndType;
