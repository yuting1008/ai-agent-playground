import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';
import { getCompletion } from '../lib/openai';
import { CAMERA_PHOTO_LIMIT } from '../lib/const';

export const definition: ToolDefinitionType = {
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
        default: CAMERA_PHOTO_LIMIT
      }
    }
  }
};

export const handler: Function = async ({ prompt, seconds }: { [key: string]: any }) => {

  console.log('prompt', prompt);
  console.log('seconds', seconds);
  


  const { photos,photosRef } = useContexts();

  console.log('photos.length', photos.length);
  console.log('photosRef.current.length', photosRef.current.length);

  if (seconds > CAMERA_PHOTO_LIMIT) {
    return { error: `The maximum number of seconds is ${CAMERA_PHOTO_LIMIT}` };
  }

  if (photos.length === 0) {
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
  photos.forEach((photo: string) => {
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
  
    return { message: resp };
  } catch (error) {
    console.error('vision error', error);

    return { error: error };
  }

};
