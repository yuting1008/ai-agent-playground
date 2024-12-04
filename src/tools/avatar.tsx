import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useSettings } from '../providers/SettingsProvider';
import { useContexts } from '../providers/AppProvider';
import { delayFunction } from '../lib/helper';

export const definition: ToolDefinitionType = {
  name: 'turn_on_off_avatar',
  description:
    'You can turn on / off your virtual human avatar. respond wait message to the user before calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      on: {
        type: 'boolean',
        description: 'bool of turn on or off avatar.'
      }
    },
    required: ['on']
  }
};

export const handler: Function = async ({ on }: { [key: string]: boolean }) => {

  const {
    cogSvcSubKeyRef,
    cogSvcRegionRef,
  } = useSettings();
  
  const {
  
    
    isAvatarStartedRef, 
  
    stopAvatarSession, startAvatarSession
  } = useContexts();

  if (on) {
    const cogSvcSubKey = cogSvcSubKeyRef.current;
    const cogSvcRegion = cogSvcRegionRef.current;

    if (!cogSvcSubKey || !cogSvcRegion) {
      return { message: 'Please set your Cognitive Services subscription key and region.' };
    }

    await startAvatarSession();

    let checkTime = 0;

    while (checkTime < 10) {
      await delayFunction(1000);
      checkTime++;
      if (isAvatarStartedRef.current) {
        return { message: 'ok' };
      }
    }

    return { message: 'Error, please check your error message.' };
  }

  stopAvatarSession();

  return { message: 'done' };
};
