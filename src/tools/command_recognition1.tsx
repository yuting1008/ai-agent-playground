import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

const commands = [
  '打开相机预览模式',
  '请帮我找到步行的路线',
  '把所有通知/消息都删除',
];

export const definition: ToolDefinitionType = {
  name: 'command_recognition1',
  description: `recognize the command of the user. the command must be one of the following: ${commands.join(
    ', ',
  )}.`,
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'the command of the user.',
      },
      params: {
        type: 'object',
        description: 'the parameters of the command.',
        default: {},
      },
    },
    required: ['command', 'params'],
  },
};

export const handler: Function = async ({
  command,
  params,
}: {
  command: string;
  params: object;
}) => {
  alert('command_recognition1: ' + command + '\n\n' + JSON.stringify(params));
  return {
    message: 'i have received the command, please look at the alert window.',
  };
};
