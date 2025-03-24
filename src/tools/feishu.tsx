import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { Profiles } from '../lib/Profiles';

const profiles = new Profiles();
const profile = profiles.currentProfile;

export const definition: ToolDefinitionType = {
  name: 'feishu',
  description: 'Send message to feishu(飞书).',
  parameters: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'message to feishu',
      },
    },
  },
};

export const handler: Function = async ({
  message,
}: {
  [key: string]: any;
}) => {
  const feishuHook = profile?.feishuHook || '';
  if (!feishuHook) {
    throw new Error('Feishu hook is not set, please set it in the settings.');
  }
  const token = feishuHook.replace(
    'https://open.feishu.cn/open-apis/bot/v2/hook/',
    '',
  );
  const url = `https://open.feishu.cn/open-apis/bot/v2/hook/${token}`;

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      msg_type: 'text',
      content: {
        text: message,
      },
    }),
  });

  return await result.json();
};
