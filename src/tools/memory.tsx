import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';

export const definition: ToolDefinitionType = {
  name: 'set_memory',
  description: 'Saves important data about the user into memory.',
  parameters: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description:
          'The key of the memory value. Always use lowercase and underscores, no other characters.'
      },
      value: {
        type: 'string',
        description: 'Value can be anything represented as a string'
      }
    },
    required: ['key', 'value']
  }
};

export const handler: Function = async ({ key, value }: { [key: string]: any }) => {
  const { setMemoryKv } = useContexts();
  setMemoryKv((memoryKv) => {
    const newKv = { ...memoryKv };
    newKv[key] = value;
    return newKv;
  });
  return { ok: true };
};
