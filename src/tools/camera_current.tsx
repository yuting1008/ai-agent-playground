import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'camera_current',
  description:
    'What do you see now? What is in this camera now? no respond any message to the user before or after calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'prompt of the camera',
        default: '',
      },
    },
  },
};
