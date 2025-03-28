import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'set_memory',
  description: 'Saves important data about the user into memory.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The key of the memory value. Always use lowercase and underscores, no other characters.',
      },
      value: {
        type: 'string',
        description: 'Value can be anything represented as a string',
      },
    },
    required: ['key', 'value'],
  },
};
