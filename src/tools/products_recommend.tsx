import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { products } from '../lib/const';
import { getJsonData } from '../lib/openai';

export const definition: ToolDefinitionType = {
  name: 'products_recommend',
  description:
    'Retrieves the food to eat, recommend fast food and food. you can recommend food url. respond wait message to the user before calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      requirements: {
        type: 'string',
        description: 'requirements of food',
      },
    },
  },
};

export const handler: Function = async ({
  requirements,
}: {
  [key: string]: string;
}) => {
  const messages = [
    {
      role: 'system',
      content: `你是一个商品推荐助手，你要根据客户的需求，在以下列表中选出合适的一个或者多个商品推荐给客户。如果没有合适的，就说一声抱歉。你记得要说，这些都是微软大中华区 STU Azure 团队研发的demo。你一定要给出 url 网址，把 url 网址原文给我。你一定要给我 json。\n 商品列表如下： ${JSON.stringify(products)}`,
    },
    {
      role: 'user',
      content: requirements,
    },
  ];

  const resp = await getJsonData(messages);

  return {
    products: products,
    resp: resp,
  };
};
