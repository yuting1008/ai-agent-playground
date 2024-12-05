import React from 'react';
import { useContexts } from '../providers/AppProvider';

const Loading: React.FC = () => {
  const { loading } = useContexts();

  if (!loading) return null;

  return (
    <div style={popupStyles}>
      <div style={modalStyles}>
        Please waiting for a moment...
      </div>
    </div>
  );
};

const popupStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 99999,
  transition: 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out'
};

const modalStyles: React.CSSProperties = {
  position: 'relative',
  width: '80%',
  maxWidth: '500px',
  backgroundColor: '#fff',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
  textAlign: 'center'
};

export default Loading;
