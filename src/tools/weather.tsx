import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';
import { useSettings } from '../providers/SettingsProvider';

export const definition: ToolDefinitionType = {
  name: 'get_weather',
  description:
    'Retrieves the weather for a given lat, lng coordinate pair. Specify a label for the location.',
  parameters: {
    type: 'object',
    properties: {
      lat: {
        type: 'number',
        description: 'Latitude'
      },
      lng: {
        type: 'number',
        description: 'Longitude'
      },
      location: {
        type: 'string',
        description: 'Name of the location'
      }
    },
    required: ['lat', 'lng', 'location']
  }
};


export const handler: Function = async ({ lat, lng, location }: { [key: string]: any }) => {

  const result = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
  );

  return await result.json();
};