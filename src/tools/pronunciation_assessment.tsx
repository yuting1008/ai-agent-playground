import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'pronunciation_assessment',
  description:
    'When users speak right, then should call this tool. respond wait message to the user before calling the tool. Do not use cache. You have to call this tool every time.',
  parameters: {
    type: 'object',
    properties: {
      sentence: {
        type: 'string',
        description: 'should be a sentence to be assessed',
      },
    },
  },
};

export const handler: Function = async ({
  sentence,
}: {
  [key: string]: any;
}) => {
  return {
    result: 'success',
    sentence: sentence,
    score: 90,
  };
};
