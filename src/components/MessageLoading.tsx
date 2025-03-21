import React from 'react';

const MessageLoading: React.FC<{
  messageId: string;
}> = ({ messageId }) => {
  return (
    <div className="loading-spinner" key={messageId}>
      <div className="spinner" key={messageId + 'spinner'}></div>
    </div>
  );
};

export default MessageLoading;
