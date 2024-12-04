import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';

export const definition: ToolDefinitionType = {
  name: 'dark_mode',
  description: 'Turn on / off dark mode.',
  parameters: {
    type: 'object',
    properties: {
      on: {
        type: 'boolean',
        description: 'bool of turn on or off dark mode.',
        default: true
      }
    }
  }
};


export const handler: Function = ({ on }: { [on: string]: boolean }) => {
  const { setIsNightMode } = useContexts();
  setIsNightMode(on);
  return { ok: true };
};

