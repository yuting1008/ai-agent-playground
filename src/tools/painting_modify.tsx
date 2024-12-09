import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'painting_modify',
  description:
    'modify generated painting. respond wait message to the user before calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'prompt of the painting',
      },
      index: {
        type: 'number',
        description: 'index of the painting',
        default: 1,
      },
    },
    required: ['prompt', 'index'],
    strict: true,
  },
};
