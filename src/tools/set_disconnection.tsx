import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'set_disconnection',
  description:
    'close the network connection / power off the network connection. response you will stop working with the app before calling this function tool.',
  parameters: {
    type: 'object',
    properties: {},
  },
};
