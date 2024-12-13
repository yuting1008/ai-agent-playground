import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'camera_take_photo',
  description:
    'take a photo now. no response to the user before calling the tool. no response to the user before calling the tool.',
  parameters: {
    type: 'object',
    properties: {},
  },
};
