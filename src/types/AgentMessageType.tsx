import { LlmMessage } from '../components/AgentMessage';

export type AgentMessageType = {
  block_session?: boolean;
  content: any | LlmMessage;
  created_at: string;
  id: string;
  message_index: number;
  role: string;
  session_id: string;
  status: number;
  user_id: number;
  need_approve?: boolean;
  approve_status?: number;
};
