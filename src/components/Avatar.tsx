import React from 'react';
import { useContexts } from '../providers/AppProvider';
import './Camera.scss';

const Avatar: React.FC = () => {
  const { isAvatarStarted, isAvatarLoading } = useContexts();
  const { avatarVideoRef, avatarAudioRef, stopAvatarSession, startAvatarSession } = useContexts();

  const toggleAvatar = async () => {
    if (isAvatarStarted) {
      stopAvatarSession();
    } else {
      await startAvatarSession();
    }
  };

  return (
    <div className="content-actions container_bg remoteVideo">
      
      {
        isAvatarLoading && <div className="camLoading">
          <div className="spinner" key={'avatarLoading'}></div>
        </div>
      }

      <button className="content-block-btn"
        onClick={toggleAvatar}
        style={{ display: isAvatarLoading ? 'none' : '' }}
      >
        {isAvatarStarted ? 'Off' : 'On'}
      </button>

      <video ref={avatarVideoRef} style={{ display: isAvatarStarted ? '' : 'none' }}>Your browser does not support
        the video tag.
      </video>

      <audio ref={avatarAudioRef} style={{ display: isAvatarStarted ? '' : 'none' }}>Your browser does not support
        the audio tag.
      </audio>
      
    </div>
  );
};


export default Avatar;
