import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { useContexts } from '../providers/AppProvider';
import { getCompletion } from '../lib/openai';

export const definition: ToolDefinitionType = {
  name: 'camera_current',
  description: 'What do you see now? What is in this camera now? respond wait message to the user before calling the tool.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'prompt of the camera'
      }
    }
  }
};
