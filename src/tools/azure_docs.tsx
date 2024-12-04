import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const GRAPHRAG_ABOUT = 'Azure(微软云) docs';

export const definition: ToolDefinitionType = {
  name: 'azure_docs',
  description:
    `Retrieve information from ${localStorage.getItem('graphragAbout') || GRAPHRAG_ABOUT}. respond wait message to the user before calling the tool. Do not use cache. You have to call this tool every time.`,
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: `query to retrieve information from ${localStorage.getItem('graphragAbout') || GRAPHRAG_ABOUT}. Try to use the user's original input, including language.`
      }
    }
  }
};


export const handler: Function = async ({ query }: { [key: string]: any }) => {

  const graphragUrl = localStorage.getItem('graphragUrl') || '';
  const graphragApiKey = localStorage.getItem('graphragApiKey') || '';
  const graphragProjectName = localStorage.getItem('graphragProjectName') || '';

  if (!graphragUrl) {
    throw new Error('GraphRAG URL is not set, please set it in the settings.');
  }
  if (!graphragApiKey) {
    throw new Error('GraphRAG API key is not set, please set it in the settings.');
  }
  if (!graphragProjectName) {
    throw new Error('GraphRAG project name is not set, please set it in the settings.');
  }

  const graphragCache = localStorage.getItem('graphragCache') || 'Disable';

  const url = `${graphragUrl}/api/local_search`;

  var body = JSON.stringify({
    'query': query,
    'project_name': graphragProjectName,
    'community_level': 2,
    'query_source': true,
    'user_cache': graphragCache === 'Enable'
  });

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': graphragApiKey
    },
    body: body
  });

  return await result.json();
};
