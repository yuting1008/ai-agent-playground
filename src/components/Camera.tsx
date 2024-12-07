import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useContexts } from '../providers/AppProvider';
import { CAMERA_OFF, CAMERA_PHOTO_INTERVAL_MS, CAMERA_PHOTO_LIMIT, CAMERA_READY, CAMERA_STARTING } from '../lib/const';
import './Camera.scss';
import { Camera as CameraIcon, CameraOff, RefreshCw } from 'react-feather';
import { X } from 'react-feather';

const Camera: React.FC = () => {

  const webcamRef = React.useRef<Webcam>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    photos, setPhotos,
    cameraStatus, cameraStatusRef, setCameraStatus,
    replaceInstructions
  } = useContexts();

  const [facingMode, setFacingMode] = useState('user');

  const [cameraCount, setCameraCount] = useState(0);

  useEffect(() => {
    console.log('cameraStatus:', cameraStatus);
    cameraStatusRef.current = cameraStatus;

    if (cameraStatus === CAMERA_READY) {
      replaceInstructions('现在我的摄像头是关闭的', '现在我的摄像头是打开的');
    }

    if (cameraStatus === CAMERA_OFF) {
      setPhotos([]);
      replaceInstructions('现在我的摄像头是打开的', '现在我的摄像头是关闭的');
    }

  }, [cameraStatus]);

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

  const handleWebcamReady = (e: MediaStream) => {
    console.log('handleWebcamReady', e);
    setCameraStatus(CAMERA_READY);
  };

  const handleClick = () => {
    if (cameraStatus === CAMERA_READY) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (webcamRef.current && cameraStatusRef.current === CAMERA_READY) {
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
    if (cameraStatus === CAMERA_OFF) {
      setCameraStatus(CAMERA_STARTING);
    } else {
      setCameraStatus(CAMERA_OFF);
    }
  };

  const SwitchCameraIcon = () => {
    return cameraStatus === CAMERA_STARTING
      ? null
      : <button
        className="content-block-btn"
        onClick={toggleCamera}>
        {cameraStatus !== CAMERA_OFF ? <CameraIcon /> : <CameraOff />}
      </button>
  }

  const RefreshCameraIcon = () => {
    return cameraCount > 1 && cameraStatus === CAMERA_READY
      ? <button className="content-block-btn switch"
        style={{ display: cameraStatus !== CAMERA_READY ? 'none' : '' }}
        onClick={toggleCameraModel}>
        <RefreshCw />
      </button>
      : null;
  }

  const CameraLoading = () => {
    return cameraStatus === CAMERA_STARTING
      ? <div className="camLoading"><div className="spinner" key={'camLoading'}></div></div>
      : null;
  }

  const PhotosBrowser = () => {
    return isModalOpen ?
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>

          <div>
            <X style={styles.closeButton}
              onClick={closeModal} />
          </div>

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
      : null;
  }


  return (
    <div className="content-block camera container_bg">

      <div>
        <SwitchCameraIcon />
        <RefreshCameraIcon />
      </div>

      <CameraLoading />


      {
        cameraStatus !== CAMERA_OFF && (
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

      <PhotosBrowser />

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
    width: '90%',
    maxWidth: '750px',
    maxHeight: '80%',
    overflowY: 'auto' as 'auto'
  },
  closeButton: {
    marginBottom: '10px',
    cursor: 'pointer',
    float: 'right' as 'right',
    color: '#626262'
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
