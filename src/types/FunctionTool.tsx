import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';

export type FunctionTool = {
  type: 'function';
  function: ToolDefinitionType;
};
