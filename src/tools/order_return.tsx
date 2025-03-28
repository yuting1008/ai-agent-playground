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
        description: 'The order id',
      },
    },
    required: ['order_id'],
  },
};

export const handler: Function = async ({
  order_id,
}: {
  [order_id: string]: string;
}) => {
  return {
    message: `return of goods for order ${order_id} is completed`,
  };
};
