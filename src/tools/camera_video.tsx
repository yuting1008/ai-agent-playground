import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { CAMERA_PHOTO_LIMIT } from '../lib/const';

export const definition: ToolDefinitionType = {
  name: 'camera_video_record',
  description:
    'What have you seen in the past time? What have you seen in the past time in this camera? no respond any message to the user before or after calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'prompt of the camera',
        default: '',
      },
      seconds: {
        type: 'number',
        description: 'how many seconds to record past',
        default: CAMERA_PHOTO_LIMIT,
      },
    },
  },
};
