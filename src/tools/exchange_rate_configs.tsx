import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { Profiles } from '../lib/Profiles';

const profiles = new Profiles();
const profile = profiles.currentProfile;

export const definition: ToolDefinitionType = {
  name: 'exchange_rate_configs',
  description:
    'Get a list of supported currency codes. If the data is not up-to-date, it may be because you are using a free API.',
  parameters: {
    type: 'object',
    properties: {},
  },
};

export const handler: Function = async ({
  from,
  to,
}: {
  [key: string]: any;
}) => {
  const mxnzpAppId = profile?.mxnzpAppId || '';
  if (!mxnzpAppId) {
    throw new Error('mxnzpAppId is not set, please set it in the settings.');
  }

  const mxnzpAppSecret = profile?.mxnzpAppSecret || '';
  if (!mxnzpAppSecret) {
    throw new Error(
      'mxnzpAppSecret is not set, please set it in the settings.',
    );
  }

  const url = `https://www.mxnzp.com/api/exchange_rate/configs?app_id=${mxnzpAppId}&app_secret=${mxnzpAppSecret}`;
  console.log('url', url);
  const result = await fetch(url, {
    method: 'GET',
  });

  return await result.json();
};
