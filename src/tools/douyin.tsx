import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'get_ip',
  description: 'Retrieves the ip and ip location',
  parameters: {
    type: 'object',
    properties: {}
  }
};

export const handler: Function = async () => {

  const url = `https://apis.juhe.cn/fapig/douyin/billboard?type=hot_video&size=&key=77f61ef638a5d25ff06ec965b939c1de`;
  console.log('ip', url);

  const result = await fetch(url);
  const data = await result.json();

  console.log('ip data', data);

  return data;
};
