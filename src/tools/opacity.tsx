import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'set_opacity',
  description: 'set the opacity of the current page.',
  parameters: {
    type: 'object',
    properties: {
      opacity: {
        type: 'number',
        description: 'the opacity of the webpage.',
        default: 1,
      },
    },
    required: ['opacity'],
  },
};
