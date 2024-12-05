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
