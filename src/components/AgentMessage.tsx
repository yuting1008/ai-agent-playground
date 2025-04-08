import Markdown from 'react-markdown';
import MessageLoading from './MessageLoading';

import { useContexts } from '../providers/AppProvider';
import ClickToJson from './ClickToJson';

type LlmMessageContent = {
  annotations: string[];
  text: string;
  type: string;
};

export type LlmMessage = {
  arguments?: object;
  call_id?: string;
  content?: object | LlmMessageContent[];
  id: string;
  name?: string;
  output?: string;
  role?: string;
  status?: number;
  type?: string;
};

export type AgentMessage = {
  block_session?: boolean;
  content: LlmMessage;
  created_at: string;
  id: string;
  message_index: number;
  role: string;
  session_id: string;
  status: number;
  user_id: number;
};

type AgentMessageProps = {
  msg: AgentMessage;
};

const AgentUserMessage = ({ msg }: AgentMessageProps) => {
  return (
    <div className={'conversation-item user'}>
      <div className={`speaker user`}></div>
      <div className={`speaker-content user`}>
        {msg?.content?.content?.toString() || JSON.stringify(msg)}{' '}
        <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentUserOtherMessage = ({ msg }: AgentMessageProps) => {
  let text = msg?.content?.content?.toString() || '';

  return (
    <div className={'conversation-item user'}>
      <div className={`speaker user`}></div>
      <div className={`speaker-content user`}>
        {text} <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentAssistantOtherMessage = ({ msg }: AgentMessageProps) => {
  let text = msg?.content?.content?.toString() || '';

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        {text && <Markdown>{text}</Markdown>}
        {!text && <MessageLoading messageId="msg_loading" />}
      </div>
    </div>
  );
};

const AgentUnknownMessage = ({ msg }: AgentMessageProps) => {
  const { isNightMode } = useContexts();

  let text = JSON.stringify(msg, null, 2);

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div
        className={`speaker-content assistant`}
        style={{
          background: isNightMode ? '#084c9a' : '#afd3f2',
          color: isNightMode ? 'white' : 'black',
        }}
      >
        {text && <Markdown>{text}</Markdown>}
        {!text && <MessageLoading messageId="msg_loading" />}

        <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentAssistantMessage = ({ msg }: AgentMessageProps) => {
  let text = JSON.stringify(msg, null, 2);

  if (Array.isArray(msg?.content?.content)) {
    text = msg?.content?.content?.[0]?.text;
  }

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        {text && <Markdown>{text}</Markdown>}
        {!text && <MessageLoading messageId="msg_loading" />}
        <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentCodeMessage = ({ msg }: AgentMessageProps) => {
  let text = msg?.content?.content?.toString() || '';

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        {text.split('\n').map((line: string, index: number) => (
          <div key={index}>
            <span>{`${index + 1}. `}</span>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AgentLoadingMessage = () => {
  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        <MessageLoading messageId="msg_loading" />
      </div>
    </div>
  );
};

export const AgentWaitClientMessage = () => {
  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        <MessageLoading messageId="msg_loading" text="Waiting for client..." />
      </div>
    </div>
  );
};

export default function AgentMessage({ msg }: AgentMessageProps) {
  switch (msg.role) {
    case 'user':
      return <AgentUserMessage msg={msg} />;
    case 'client_tool':
      return <AgentUserMessage msg={msg} />;
    case 'assistant':
      return <AgentAssistantMessage msg={msg} />;
    case 'code':
      return <AgentCodeMessage msg={msg} />;
    default:
      return <AgentOtherMessage msg={msg} />;
  }
}

function AgentOtherMessage({ msg }: AgentMessageProps) {
  switch (msg.content.type) {
    case 'function_call':
      return <AgentAssistantOtherMessage msg={msg} />;
    case 'function_call_output':
      return <AgentUserOtherMessage msg={msg} />;
    default:
      return <AgentUnknownMessage msg={msg} />;
  }
}
