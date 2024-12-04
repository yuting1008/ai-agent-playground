import React, { useEffect, useState } from 'react';
import { RealtimeClient } from '@theodoreniu/realtime-api-beta';
import { getImages } from '../utils/openai';
import { WavStreamPlayer } from '../lib/wavtools';

interface ChildComponentProps {
  client: RealtimeClient;
  wavStreamPlayer: WavStreamPlayer;
}

const Painting: React.FC<ChildComponentProps> = ({ client, wavStreamPlayer }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const mime = 'data:image/png;base64';

  useEffect(() => {
    if (imageUrl) {
      localStorage.setItem('imageUrl', imageUrl);
    }
  }, [imageUrl]);

  useEffect(() => {

    /**
     * painting
     */
    client.addTool(
      {
        name: 'paint',
        description: 'Painting by text, text to image. respond wait message to the user before calling the tool.',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'prompt of the image'
            }
          }
        }
      },
      async ({ prompt }: { [key: string]: any }) => {

        setIsVisible(false);

        try {
          const resp = await getImages(prompt = prompt);

          console.log('painting', resp);

          setIsVisible(true);
          // setImageUrl(data.data[0].b64_json);
          return { result: resp };
        } catch (error) {
          console.error('painting error', error);

          setIsVisible(false);
          return { error: error };
        }

      }
    );

    /**
     * image modify
     */
    client.addTool(
      {
        name: 'image_modify',
        description: 'image to image, image modify',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'prompt of the image to modify'
            }
          }
        }
      },
      async ({ prompt }: { [key: string]: any }) => {

        const oldImg = localStorage.getItem('imageUrl') || '';

        if (!oldImg) {
          return {
            error: 'please painting image first'
          };
        }

        setIsVisible(false);


        try {
          const result = await fetch(
            `/api/images/edits`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                'image': oldImg,
                'prompt': prompt,
                'n': 1,
                'size': '1024x1024',
                'response_format': 'b64_json'
              })
            }
          );
          const data = await result.json();
          console.log(data);
          const base64Data = data.data?.[0]?.b64_json;
          if (!base64Data) {
            return data;
          }

          setImageUrl(base64Data);

          setIsVisible(true);
          return { result: data };
        } catch (error) {
          console.error('image_modify error', error);

          setIsVisible(false);
          return { error: error };
        }

      }
    );

    /**
     * image_to_video
     */
    client.addTool(
      {
        name: 'image_to_video',
        description: 'image video, generate video by image',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'prompt of the image to modify'
            }
          }
        }
      },
      async ({ prompt }: { [key: string]: any }) => {

        return {
          message: 'this feature is developing, And to be completed by November 2024'
        };

      }
    );


    return () => {
    };
  }, []);

  const closeModal = () => {
    setIsVisible(false);
  };

  if (!isVisible || !imageUrl) return null;

  return (
    <div style={popupStyles}>

      <div style={overlayStyles} onClick={() => setIsVisible(false)} />

      <div style={modalStyles}>
        <img src={`${mime},${imageUrl}`} alt="img" style={{ width: '100%', height: 'auto' }} />
        <button onClick={closeModal} style={closeButtonStyles}>
          Close
        </button>
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

const overlayStyles: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
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

const closeButtonStyles: React.CSSProperties = {
  marginTop: '10px',
  padding: '8px 16px',
  backgroundColor: '#007BFF',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'block',
  textAlign: 'center'
};


export default Painting;
