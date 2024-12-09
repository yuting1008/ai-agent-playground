import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export const definition: ToolDefinitionType = {
  name: 'get_news',
  description: 'Retrieves the current news.',
  parameters: {
    type: 'object',
    properties: {},
  },
};

export const handler: Function = async () => {
  const newsKey = localStorage.getItem('newsKey') || '';
  if (!newsKey) {
    throw new Error('News key is not set, please set it in the settings.');
  }

  // loadingInternetAudio.volume = 1;
  // loadingInternetAudio.play();
  // await delayFunction(loadingInternetAudioTime);

  const url = `https://route.showapi.com/109-35?appKey=${newsKey}`;
  console.log('fetch news url', url);
  const result = await fetch(url);
  return await result.json();
};
