import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';

export const definition: ToolDefinitionType = {
  name: 'camera_on_or_off',
  description: 'turn off or turn on camera now. only respond wait message to the user before calling the tool if turn on camera.',
  parameters: {
    type: 'object',
    properties: {
      on: {
        type: 'boolean',
        description: 'turn on or off camera',
        default: true
      }
    },
    required: ['on']
  }
};

export const handler: Function = async ({ on }: { [on: string]: boolean }) => {
  const { setPhotos, setIsCameraOn } = useContexts();

  if (on) {
    setIsCameraOn(true);
    return { message: 'The camera is starting, please wait a moment to turn on.' };
  }

  setPhotos([]);
  setIsCameraOn(false);

  return { message: 'The camera has been turned off' };
};
