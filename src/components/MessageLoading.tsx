import React from 'react';

const MessageLoading: React.FC<{
  messageId: string;
  text?: string;
}> = ({ messageId, text }) => {
  return (
    <div className="loading-spinner" key={messageId}>
      <div className="spinner" key={messageId + 'spinner'}></div>
      {text && <div className="text">{text}</div>}
    </div>
  );
};

export default MessageLoading;
