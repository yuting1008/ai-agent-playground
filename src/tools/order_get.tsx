import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'get_orders',
  description: 'Retrieves the orders',
  parameters: {
    type: 'object',
    properties: {},
  },
};

export const handler: Function = async () => {
  return {
    orders: [
      {
        id: 11,
        name: 'Order 11',
        status: 'pending',
        created_at: '2024-01-01 12:00:00',
      },
      {
        id: 22,
        name: 'Order 22',
        status: 'completed',
        created_at: '2024-01-01 12:00:00',
      },
    ],
  };
};
