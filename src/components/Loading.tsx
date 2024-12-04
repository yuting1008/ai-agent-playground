import React from 'react';
import { usePhotos } from '../context/AppProvider';

const Loading: React.FC = () => {
  const { loading, setLoading } = usePhotos();

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
  zIndex: 90000
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
