import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'camera_on_or_off',
  description:
    'turn off or turn on camera now. only respond wait message to the user before calling the tool if turn on camera.',
  parameters: {
    type: 'object',
    properties: {
      on: {
        type: 'boolean',
        description: 'turn on or off camera',
        default: true,
      },
    },
    required: ['on'],
  },
};
