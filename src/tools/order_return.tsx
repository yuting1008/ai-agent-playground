import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'return_of_goods',
  description:
    'Returns the goods for a given order id. Specify a order id for the order.',
  parameters: {
    type: 'object',
    properties: {
      order_id: {
        type: 'string',
        description: 'The order id'
      }
    },
    required: ['order_id']
  }
};
