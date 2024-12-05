import React, { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useContexts } from '../providers/AppProvider';
import { CAMERA_PHOTO_INTERVAL_MS, CAMERA_PHOTO_LIMIT } from '../lib/const';
import './Camera.scss';
import { Camera as CameraIcon, CameraOff, RefreshCw } from 'react-feather';

const Camera: React.FC = () => {
  const webcamRef = React.useRef<Webcam>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { photos, isCameraOn, isCameraOnRef,setPhotos, setIsCameraOn, isWebcamReady, isWebcamReadyRef,setIsWebcamReady } = useContexts();
  const [facingMode, setFacingMode] = useState('user');
  const [cameraCount, setCameraCount] = useState(0);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraCount(videoDevices.length);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getCameras();
  }, []);

  const toggleCameraModel = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };

  const handleWebcamReady = () => {
    setIsWebcamReady(true);
  };

  const handleClick = () => {
    if (isWebcamReady) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
        if (webcamRef.current && isCameraOnRef.current && isWebcamReadyRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            setPhotos(prevPhotos => {
              return [imageSrc, ...prevPhotos].slice(0, CAMERA_PHOTO_LIMIT);
            });
          }
        }
    }, CAMERA_PHOTO_INTERVAL_MS);

    return () => {
        clearInterval(intervalId);
    };
}, []);

  const toggleCamera = () => {
    setIsCameraOn(prev => !prev);
  };

  return (
    <div className="content-block camera container_bg">

      <div>

        <button className="content-block-btn"
          style={{ display: (isCameraOn && !isWebcamReady) ? 'none' : '' }}
          onClick={toggleCamera}>
          {isCameraOn ? <CameraIcon /> : <CameraOff />}
        </button>

        {
          cameraCount > 1 && (
            <button className="content-block-btn switch"
              style={{ display: !isWebcamReady ? 'none' : '' }}
              onClick={toggleCameraModel}>
              <RefreshCw />
            </button>
          )
        }

      </div>



      {
        isCameraOn && !isWebcamReady && <div className="camLoading"><div className="spinner" key={'camLoading'}></div></div>
      }


      {
        isCameraOn && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className={'content-block-webcam'}
            onClick={handleClick}
            videoConstraints={{ facingMode }}
            onUserMedia={handleWebcamReady}
          />
        )
      }

      {
        isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <button style={styles.closeButton} onClick={closeModal}>Close</button>
              {photos.length > 0 ? (
                <div style={styles.imageContainer}>
                  {photos.map((base64Img, index) => (
                    <img key={index} src={base64Img} alt={`Image ${index + 1}`} style={styles.image} />
                  ))}
                </div>
              ) : (
                <p>No photos</p>
              )}
            </div>
          </div>
        )
      }

    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90000
  },
  modalContent: {
    backgroundColor: '#ededed',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '750px',
    maxHeight: '80%',
    overflowY: 'auto' as 'auto'
  },
  closeButton: {
    marginBottom: '10px',
    cursor: 'pointer'
  },
  imageContainer: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: '10px'
  },
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'cover' as 'cover'
  }
};

export default Camera;
