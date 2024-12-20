import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'search',
  description:
    "Search anything on the web. You don't need to say anything after the search. no respond any message to the user before or after calling the tool.",
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The query to search the web with',
      },
      count: {
        type: 'number',
        description: 'The number of results to return',
        default: 10,
      },
      page: {
        type: 'number',
        description: 'The page number to return',
        default: 1,
      },
    },
    required: ['query'],
  },
};
