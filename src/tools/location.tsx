import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'get_ip',
  description:
    'Retrieves the ip and ip location, you can get my location from ip',
  parameters: {
    type: 'object',
    properties: {},
  },
};

export const handler: Function = async () => {
  const url = `https://ip-api.io/json`;
  console.log('fetch ip', url);

  const result = await fetch(url);
  const data = await result.json();

  console.log('ip data', data);

  return data;
};
