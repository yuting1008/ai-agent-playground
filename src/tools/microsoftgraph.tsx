import 'isomorphic-fetch';

import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'microsoft_graph',
  description: 'Get user details from Microsoft Graph API',
  parameters: {
    type: 'object',
    properties: {},
  },
};

export const handler: Function = async () => {
  return {
    message: '接入微软内部系统的程序还在开发中',
  };
};
