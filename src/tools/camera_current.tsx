import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';
import { getCompletion } from '../lib/openai';

export const definition: ToolDefinitionType = {
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
};

export const handler: Function = async ({ prompt }: { [key: string]: any }) => {



  try {

    console.log('prompt', prompt);

   
    const { photos,photosRef } = useContexts();
  
    console.log('photos.length', photos.length);
    console.log('photosRef.current.length', photosRef.current.length);
    
    if (photos.length === 0) {
      return { error: 'no photos, please turn on your camera' };
    }
  
    let content: any = [
      {
        type: 'text',
        text: `Can you describe what you saw? User questions about these frames are: ${prompt}`
      }
    ];
  
    const photoIndex = photos.length >= 1 ? 1 : 0;
  
    content.push({
      type: 'image_url',
      image_url: {
        url: photos[photoIndex]
      }
    });
  
 

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
