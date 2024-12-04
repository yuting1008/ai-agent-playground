import React, { useState } from 'react';
import { useContexts } from '../providers/AppProvider';
import './CameraComponent.scss';

const Avatar: React.FC = () => {
  const { isAvatarStartedRef, isAvatarLoadingRef } = useContexts();
  const { avatarVideoRef, avatarAudioRef, stopAvatarSession, startAvatarSession } = useContexts();

  const toggleAvatar = async () => {
    if (isAvatarStartedRef.current) {
      stopAvatarSession();
    } else {
      await startAvatarSession();
    }
  };

  return (
    <div className="content-actions container_bg remoteVideo">
      {
        isAvatarLoadingRef.current ? <div className="camLoading">
          <div className="spinner" key={'avatarLoading'}></div>
        </div> : null
      }
      <button className="content-block-btn"
        onClick={toggleAvatar}
        style={{ display: isAvatarLoadingRef.current ? 'none' : '' }}
      >
        {isAvatarStartedRef.current ? 'Off' : 'On'}
      </button>

      <video ref={avatarVideoRef} style={{ display: isAvatarStartedRef.current ? '' : 'none' }}>Your browser does not support
        the video tag.
      </video>

      <audio ref={avatarAudioRef} style={{ display: isAvatarStartedRef.current ? '' : 'none' }}>Your browser does not support
        the audio tag.
      </audio>
      
    </div>
  );
};


export default Avatar;
