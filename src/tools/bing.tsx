import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'bing_search',
  description: 'Search anything on the web. You don\'t need to say anything after the search. no respond any message to the user before or after calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The query to search the web with'
      }
    },
    required: ['query']
  }
};
