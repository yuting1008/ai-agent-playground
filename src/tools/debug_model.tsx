import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'set_debug_mode',
  description:
    'set the debug mode of the app. you can print log to console when debug mode is on.',
  parameters: {
    type: 'object',
    properties: {
      debug_mode: {
        type: 'boolean',
        description: 'the debug mode of the app.',
        default: false,
      },
    },
    required: ['debug_mode'],
  },
};
