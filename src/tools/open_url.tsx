import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'open_url',
  description: 'open a url in the browser.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description:
          'the url to open, you must use https or http protocol, otherwise it will not work.',
      },
    },
    required: ['url'],
  },
};

export const handler: Function = async ({ url }: { url: string }) => {
  window.open(url, '_blank');
  return {
    ok: true,
  };
};
