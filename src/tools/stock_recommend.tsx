import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { Profiles } from '../lib/Profiles';

const profiles = new Profiles();
const profile = profiles.currentProfile;

export const definition: ToolDefinitionType = {
  name: 'stock_recommend',
  description:
    'Get latest analyst recommendation trends for a company about stock. data from Finnhub API.',
  parameters: {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: 'Symbol of the company',
      },
    },
    required: ['symbol'],
  },
};

export const handler: Function = async ({ symbol }: { [key: string]: any }) => {
  const quoteToken = profile?.quoteToken || '';
  if (!quoteToken) {
    throw new Error('Quote token is not set, please set it in the settings.');
  }

  const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${quoteToken}`;
  console.log('url', url);
  const result = await fetch(url, {
    method: 'GET',
  });

  return await result.json();
};
