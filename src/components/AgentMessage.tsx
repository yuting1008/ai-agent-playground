import Markdown from 'react-markdown';
import MessageLoading from './MessageLoading';

type LlmMessage = {
  role?: string;
  content?: object;
  arguments?: object;
  call_id?: string;
  name?: string;
  type?: string;
  id?: string;
  output?: string;
  status?: string;
};

type AgentMessage = {
  user_id: number;
  id: string;
  content: LlmMessage;
  session_id: string;
  role: string;
  message_index: number;
  created_at: string;
};

type AgentMessageProps = {
  msg: AgentMessage;
};

const AgentUserMessage = ({ text }: { text: string }) => {
  return (
    <div className={'conversation-item user'}>
      <div className={`speaker user`}></div>
      <div className={`speaker-content user`}>{text}</div>
    </div>
  );
};

const AgentUserOtherMessage = ({ text }: { text: string }) => {
  return (
    <div className={'conversation-item user'}>
      <div className={`speaker user`}></div>
      <div className={`speaker-content user`}>{text}</div>
    </div>
  );
};

const AgentAssistantOtherMessage = ({ text }: { text: string }) => {
  text = text.trim();

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

const AgentUnknownMessage = ({ text }: { text: string }) => {
  text = text.trim();

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`} style={{ color: 'red' }}>
        {text && <Markdown>{text}</Markdown>}
        {!text && <MessageLoading messageId="msg_loading" />}
      </div>
    </div>
  );
};

const AgentAssistantMessage = ({ text }: { text: string }) => {
  text = text.trim();

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

const AgentCodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        {text.split('\n').map((line, index) => (
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

export default function AgentMessage({ msg }: AgentMessageProps) {
  let content = JSON.stringify(msg, null, 2);

  if (!msg?.content?.role) {
    return <AgentUnknownMessage text={content} />;
  }

  switch (msg.content.role) {
    case 'user':
      return <AgentUserMessage text={content} />;
    case 'assistant':
      return <AgentAssistantMessage text={content} />;
    case 'code':
      return <AgentCodeMessage text={content} />;
    default:
      return <AgentOtherMessage msg={msg} />;
  }
}

function AgentOtherMessage({ msg }: AgentMessageProps) {
  let content = JSON.stringify(msg, null, 2);

  switch (msg.content.type) {
    case 'function_call':
      return <AgentAssistantOtherMessage text={content} />;
    case 'function_call_output':
      return <AgentUserOtherMessage text={content} />;
    default:
      return <AgentUnknownMessage text={content} />;
  }
}
