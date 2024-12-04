import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { demos } from '../utils/conversation_config';
import { getCompletion } from '../utils/openai';

export const definition: ToolDefinitionType = {
  name: 'demo',
  description: 'Get Demo or sample code or 代码示例, 推荐 Demo 和解决方案',
  parameters: {
    type: 'object',
    properties: {
      requirements: {
        type: 'string',
        description: 'requirements of demo'
      }
    }
  }
};

export const handler: Function = async ({ requirements }: { [key: string]: string }) => {


  const messages = [
    {
      role: 'system',
      content: `你是一个demo推荐助手，你要根据客户的需求，在以下列表中选出合适的一个或者多个demo推荐给客户。如果没有合适的，就说一声抱歉。你记得要说，这些都是微软大中华区 STU Azure 团队研发的demo。你一定要给出 url 网址，把 url 网址原文给我，如果这个demo需要密码才能体验，也请提醒需要密码才能浏览。\n demo 列表： ${JSON.stringify(demos)}`
    },
    {
      role: 'user',
      content: requirements
    }
  ];


  return await getCompletion(messages);
};
