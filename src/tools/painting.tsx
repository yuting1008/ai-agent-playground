import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { getImages } from '../lib/openai';

export const definition: ToolDefinitionType = {
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
};


export const handler: Function = async ({ prompt }: { [key: string]: any }) => {

  try {
    const resp = await getImages(prompt = prompt);
    console.log('painting', resp);
    return { result: resp };
  } catch (error) {
    console.error('painting error', error);
    return { error: error };
  }

};
