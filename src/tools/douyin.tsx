import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'get_douyin_hot_video',
  description: 'Retrieves the douyin(抖音/tiktok) hot video',
  parameters: {
    type: 'object',
    properties: {},
  },
};

export const handler: Function = async () => {
  const url = `https://apis.juhe.cn/fapig/douyin/billboard?type=hot_video&size=&key=77f61ef638a5d25ff06ec965b939c1de`;

  const result = await fetch(url);
  const data = await result.json();

  return data;
};
