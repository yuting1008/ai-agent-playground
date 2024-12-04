import React, { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useContexts } from '../AppProvider';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { CAMERA_PHOTO_LIMIT } from '../lib/const';


interface ChildComponentProps {
  client: RealtimeClient;
}

const RagComponent: React.FC<ChildComponentProps> = ({ client }) => {
  const webcamRef = React.useRef<Webcam>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isUploadedRag, setIsUploadedRag] = useState(false);
  const { setPhotos, replaceInstructions } = useContexts();
  const photoInterval = 1000;


  useEffect(() => {

    if (client.isConnected()) {
      console.log('update instructions');
      client.updateSession({
        instructions: isCameraOn ? replaceInstructions('现在我的摄像头是关闭的', '现在我的摄像头打开的')
          : replaceInstructions('现在我的摄像头打开的', '现在我的摄像头是关闭的')
      });


    } else {
      console.log('client is not connected, not update instructions');
    }

  }, [isCameraOn]);


  const capture = useCallback(() => {
    if (webcamRef.current && isCameraOn) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhotos(prevPhotos => {
          return [imageSrc, ...prevPhotos].slice(0, CAMERA_PHOTO_LIMIT);
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
      if (intervalId) clearInterval(intervalId);
    };
  }, [capture, isCameraOn]);


  useEffect(() => {


    client.addTool({
      name: 'rag',
      description: 'upload your data file or update your data file',
      parameters: {
        type: 'object',
        properties: {}
      }
    }, () => {

      if (!isUploadedRag) {
        return {
          message: 'Please upload your data first',
          isRag: true
        };
      }

      return { message: 'data uploaded' };
    });

    return () => {
    };
  }, []);


  return (
    <div>
    </div>
  );
};

export default RagComponent;
