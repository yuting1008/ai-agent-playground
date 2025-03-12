import React, { useEffect, useState } from 'react';
import { useContexts } from '../providers/AppProvider';
import { X } from 'react-feather';

const AppMessage: React.FC = () => {
  const { isNightMode } = useContexts();

  const [messages, setMessages] = useState<any[]>(
    JSON.parse(localStorage.getItem('messages') || '[]'),
  );

  useEffect(() => {
    console.log('messages', messages);
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const messages = JSON.parse(localStorage.getItem('messages') || '[]');
      setMessages(messages);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const styles = {
    content: {
      width: '100%',
      height: 'auto',
      padding: '20px',
      fontSize: '12px',
      wordBreak: 'break-word',
      backgroundColor: 'green',
      marginBottom: '15px',
      borderRadius: '10px',
    } as React.CSSProperties,
    backdrop: {
      position: 'fixed',
      top: 45,
      right: 13,
      width: '400px',
      height: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      zIndex: 9999,
    } as React.CSSProperties,
    modal: {
      width: '100%',
      maxHeight: '80%',
      overflowY: 'auto',
      position: 'relative',
      padding: '10px',
      color: 'white',
    } as React.CSSProperties,
  };

  return (
    <>
      <div style={styles.backdrop}>
        <div style={styles.modal}>
          {messages.map((message, index) => (
            <div key={index} style={styles.content}>
              <X
                size={16}
                style={{
                  cursor: 'pointer',
                  display: 'block',
                  marginBottom: '10px',
                }}
                onClick={() => {
                  setMessages(messages.filter((_, i) => i !== index));
                }}
              />

              {JSON.stringify(message)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppMessage;
