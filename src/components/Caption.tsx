import React, { useEffect } from 'react';
import { useContexts } from '../providers/AppProvider';

const Caption: React.FC = () => {
  const { caption, setCaption, captionQueue, captionQueueRef } = useContexts();

  const style: React.CSSProperties = {
    position: 'absolute',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px 25px',
    backgroundColor: '#0f7f07',
    color: 'white',
    borderRadius: '5px',
    fontSize: '18px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: '99000',
    fontWeight: '300',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCaption('');
    }, 15000);

    return () => clearTimeout(timer);
  }, [caption, setCaption]);

  useEffect(() => {
    captionQueueRef.current = captionQueue;
    if (captionQueue.length > 0) {
      setCaption(captionQueue[0]);
    } else {
      setCaption('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captionQueue]);

  return caption ? (
    <div style={style}>
      <h4>{caption}</h4>
    </div>
  ) : null;
};

export default Caption;
