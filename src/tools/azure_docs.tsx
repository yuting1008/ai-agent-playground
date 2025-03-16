import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { Profiles } from '../lib/Profiles';

export const GRAPHRAG_ABOUT = 'Azure(微软云) docs';

export const definition: ToolDefinitionType = {
  name: 'azure_docs',
  description: `Retrieve information from {rag}. respond wait message to the user before calling the tool. Do not use cache. You have to call this tool every time.`,
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          "query to retrieve information from Azure docs. Try to use the user's original input, including language.",
      },
    },
  },
};

export const handler: Function = async ({ query }: { [key: string]: any }) => {
  const profiles = new Profiles();
  const profile = profiles.currentProfile;
  const graphragUrl = profile?.graphragUrl || '';
  const graphragApiKey = profile?.graphragApiKey || '';
  const graphragProjectName = profile?.graphragProjectName || '';

  if (!graphragUrl) {
    throw new Error('GraphRAG URL is not set, please set it in the settings.');
  }
  if (!graphragApiKey) {
    throw new Error(
      'GraphRAG API key is not set, please set it in the settings.',
    );
  }
  if (!graphragProjectName) {
    throw new Error(
      'GraphRAG project name is not set, please set it in the settings.',
    );
  }

  const url = `${graphragUrl}/api/local_search`;

  const body = JSON.stringify({
    query: query,
    project_name: graphragProjectName,
    community_level: 2,
    query_source: true,
    user_cache: false,
  });

  console.log('body', body);

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': graphragApiKey,
    },
    body: body,
  });

  return await result.json();
};
