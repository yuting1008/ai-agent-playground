import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'painting',
  description:
    'Painting by text, text to image. respond wait message to the user before calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'prompt of the image',
      },
      // n: {
      //   type: 'number',
      //   description: 'number of images to generate',
      //   default: 1
      // }
    },
    required: ['prompt'],
    strict: true,
  },
};
