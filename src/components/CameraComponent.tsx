import React, { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useContexts } from '../context/AppProvider';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { imageLimit } from '../utils/conversation_config.js';
import { getCompletion } from '../utils/openai';
import { WavStreamPlayer } from '../lib/wavtools';
import './CameraComponent.scss';
import { Camera, CameraOff, RefreshCw } from 'react-feather';

interface ChildComponentProps {
  client: RealtimeClient;
  wavStreamPlayer: WavStreamPlayer;
  assistantThreadId: string | null;
}

const CameraComponent: React.FC<ChildComponentProps> = ({ client, wavStreamPlayer, assistantThreadId }) => {
  const webcamRef = React.useRef<Webcam>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { photos, photosRef, setPhotos, setLoading, replaceInstructions } = useContexts();
  const [iseWebcamReady, setWebcamReady] = useState(false);
  const photoInterval = 1000;
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
    setWebcamReady(true);
  };

  useEffect(() => {

    console.log(`iseWebcamReady: ${iseWebcamReady}`);

    if (client && client.isConnected()) {
      console.log('update instructions');
      client.updateSession({
        instructions: isCameraOn ? replaceInstructions('现在我的摄像头是关闭的', '现在我的摄像头打开的') : replaceInstructions('现在我的摄像头打开的', '现在我的摄像头是关闭的')
      });
    } else {
      console.log('client is not connected, not update instructions');
    }

  }, [iseWebcamReady]);

  useEffect(() => {
    if (!isCameraOn || (!client.isConnected() && !assistantThreadId)) {
      setWebcamReady(false);
    }
  }, [isCameraOn]);

  const handleClick = () => {
    if (iseWebcamReady) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const capture = useCallback(() => {

    if (!client.isConnected() && !assistantThreadId) {
      setWebcamReady(false);
      setIsCameraOn(false);
    }

    if (webcamRef.current && isCameraOn) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhotos(prevPhotos => {
          return [imageSrc, ...prevPhotos].slice(0, imageLimit);
        });
      }
    }
  }, [webcamRef, isCameraOn]);

  useEffect(() => {

    let intervalId: NodeJS.Timeout | null = null;
    if (isCameraOn) {
      intervalId = setInterval(capture, photoInterval);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [capture, isCameraOn]);


  useEffect(() => {

    /************************************************************
     * camera_video_record
     */
    client.addTool({
      name: 'camera_video_record',
      description: 'What have you seen in the past time? What have you seen in the past time in this camera? respond wait message to the user before calling the tool.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'prompt of the camera'
          },
          seconds: {
            type: 'number',
            description: 'how many seconds to record past',
            default: imageLimit
          }
        }
      }
    }, async ({ prompt, seconds }: { [key: string]: any }) => {

      if (seconds > imageLimit) {
        return { error: `The maximum number of seconds is ${imageLimit}` };
      }

      console.log('photosList', photosRef.current);

      if (photosRef.current.length === 0) {
        return { error: 'no photos, please turn on your camera' };
      }

      let content: any = [
        {
          type: 'text',
          text: `I'm going to give you a set of video frames from the video head capture, just captured. The images are displayed in reverse chronological order. Can you describe what you saw? If there are more pictures, it is continuous, please tell me the complete event that happened just now. User questions about these frames are: ${prompt}`
        }
      ];

      // for photos
      let photoCount = 0;
      photosRef.current.forEach((photo: string) => {
        if (photoCount < seconds) {
          content.push({
            type: 'image_url',
            image_url: {
              url: photo
            }
          });
        }

        photoCount++;

      });


      setLoading(true);

      try {
        console.log('vision content', content);
        const messages = [
          {
            role: 'user',
            content: content
          }
        ];
        console.log('vision content', content);
        const resp = await getCompletion(messages);
        console.log('vision resp', resp);
        setLoading(false);
        return { message: resp };
      } catch (error) {
        console.error('vision error', error);
        setLoading(false);
        return { error: error };
      }

    });

    /************************************************************
     * camera_current
     */
    client.addTool({
      name: 'camera_current',
      description: 'What do you see now? What is in this camera now? respond wait message to the user before calling the tool.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'prompt of the camera'
          }
        }
      }
    }, async ({ prompt }: { [key: string]: any }) => {

      console.log('photosList', photosRef.current);

      if (photosRef.current.length === 0) {
        return { error: 'no photos, please turn on your camera' };
      }

      let content: any = [
        {
          type: 'text',
          text: `Can you describe what you saw? User questions about these frames are: ${prompt}`
        }
      ];

      const photoIndex = photosRef.current.length >= 1 ? 1 : 0;

      content.push({
        type: 'image_url',
        image_url: {
          url: photosRef.current[photoIndex]
        }
      });

      setLoading(true);

      try {
        const messages = [
          {
            role: 'user',
            content: content
          }
        ];
        console.log('vision content', content);
        const resp = await getCompletion(messages);
        console.log('vision resp', resp);
        setLoading(false);
        return { message: resp };
      } catch (error) {
        console.error('vision error', error);
        setLoading(false);
        return { error: error };
      }
    });

    /****************************************************************
     *
     * camera_of
     */
    client.addTool({
      name: 'camera_on_or_off',
      description: 'turn off or turn on camera now. only respond wait message to the user before calling the tool if turn on camera.',
      parameters: {
        type: 'object',
        properties: {
          on: {
            type: 'boolean',
            description: 'turn on or off camera',
            default: true
          }
        }
      }
    }, ({ on }: { [on: string]: boolean }) => {

      if (on) {
        setIsCameraOn(true);
        return { message: 'The camera is starting, please wait a moment to turn on.' };
      }

      setPhotos([]);
      setIsCameraOn(false);

      return { message: 'The camera has been turned off' };
    });

    return () => {
    };
  }, []);

  const toggleCamera = () => {
    setIsCameraOn(prev => {
      // If we're turning the camera off (prev is true), clear the storage
      if (prev) {
        setPhotos([]);
      }

      return !prev;
    });

  };

  return (
    <div className="content-block camera container_bg">

      {
        (client.isConnected() || assistantThreadId) && (
          <div>
            <button className="content-block-btn"
                    style={{ display: (isCameraOn && !iseWebcamReady) ? 'none' : '' }}
                    onClick={toggleCamera}>
              {isCameraOn ? <Camera /> : <CameraOff />}
            </button>

            <button className="content-block-btn switch"
                    style={{ display: (!iseWebcamReady) ? 'none' : '' }}
                    onClick={toggleCameraModel}>
              <RefreshCw />
            </button>
          </div>
        )
      }

      {
        (client.isConnected() || assistantThreadId) && isCameraOn && (
          iseWebcamReady ? null : <div className="camLoading">
            <div className="spinner" key={'camLoading'}></div>
          </div>
        )
      }

      {
        (client.isConnected() || assistantThreadId) && isCameraOn && (
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

      {/******************************************************/}
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
    maxWidth: '650px',
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

export default CameraComponent;
