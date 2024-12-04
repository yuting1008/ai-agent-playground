import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

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
