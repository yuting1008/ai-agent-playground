import React, { useState } from 'react';
import { X } from 'react-feather';
import { HelpCircle } from 'react-feather';
import { useContexts } from '../providers/AppProvider';
import { modalStyles } from '../styles/modalStyles';

const AboutApp: React.FC = () => {
  const [isShow, setIsShow] = useState(false);
  const { isNightMode } = useContexts();
  const importModalStyles = modalStyles({ isNightMode });

  const styles = {
    content: {
      width: '100%',
      height: 'auto',
      padding: '20px',
      fontSize: '14px',
      wordBreak: 'break-word',
    } as React.CSSProperties,
  };

  const ShowList = () => {
    if (!isShow) return null;

    return (
      <div style={importModalStyles.backdrop}>
        <div
          style={{ ...importModalStyles.modal, width: '50%' }}
          className={'modal'}
        >
          <div style={importModalStyles.header}>
            <h2>About This App</h2>
            <button
              key="close"
              onClick={() => setIsShow(false)}
              style={importModalStyles.closeBtn}
            >
              <X />
            </button>
          </div>

          <div style={styles.content}>
            AI Agent Playground is a multimodal, multi-agent AI assistant that
            allows customers to interact with AI through various means such as
            text, voice, video, and interface component operations, accurately
            completing tasks in various scenarios.
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <span
        onClick={() => setIsShow(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <HelpCircle />
      </span>
      <ShowList />
    </>
  );
};

export default AboutApp;
