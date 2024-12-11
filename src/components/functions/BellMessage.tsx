import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import { GptImage } from '../../types/GptImage';
import { Bell } from 'react-feather';
import { useBellMessages } from '../../contexts/BellMessagesContext';
import { useContexts } from '../../providers/AppProvider';
import { modalStyles } from '../../styles/modalStyles';

const BellMessage: React.FC = () => {
  const messages = useBellMessages();
  const [isShow, setIsShow] = useState(false);
  const { isNightMode } = useContexts();
  const importModalStyles = modalStyles({ isNightMode });

  const styles = {
    content: {
      padding: '20px',
      flexWrap: 'wrap',
      gap: '10px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(25%, 1fr))',
      gridGap: '10px',
    } as React.CSSProperties,
    img: {
      width: '100%',
      height: 'auto',
    } as React.CSSProperties,
  };

  useEffect(() => {
    setIsShow(messages.length > 0);
  }, [messages]);

  const ShowBellMessage = () => {
    if (!isShow) {
      return null;
    }

    return (
      <div style={importModalStyles.backdrop}>
        <div style={importModalStyles.modal} className={'modal'}>
          <div style={importModalStyles.header}>
            <h2>Images</h2>
            <button
              key="close"
              onClick={() => setIsShow(false)}
              style={importModalStyles.closeBtn}
            >
              <X />
            </button>
          </div>

          <div style={styles.content}>
            {messages.length === 0 && <div>No messages</div>}

            {messages.map((message: GptImage) => (
              <div>
                <img
                  src={`data:image/png;base64,${message.b64_json}`}
                  alt={message.prompt}
                  style={styles.img}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <span onClick={() => setIsShow(true)}>
        <Bell />
      </span>
      <ShowBellMessage />
    </>
  );
};

export default BellMessage;
