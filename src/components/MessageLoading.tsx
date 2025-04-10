import React from 'react';

const MessageLoading: React.FC<{
  messageId: string;
  text?: string;
}> = ({ messageId, text }) => {
  return (
    <>
      {text && <div>{text}</div>}
      <div className="loading-spinner" key={messageId}>
        <div className="spinner" key={messageId + 'spinner'}></div>
      </div>
    </>
  );
};

export default MessageLoading;
