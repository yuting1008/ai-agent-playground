import Markdown from 'react-markdown';
import MessageLoading from './MessageLoading';

import { useContexts } from '../providers/AppProvider';
import ClickToJson from './ClickToJson';
import { approveMessage, rejectMessage } from '../lib/agentApi';
import { AgentMessageType } from '../types/AgentMessageType';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useState } from 'react';

type LlmMessageContent = {
  annotations: string[];
  text: string;
  type: string;
};

type ToolCall = {
  call_id: string;
  type: string;
  name: string;
  id: string;
  arguments: object;
};

export type LlmMessage = {
  arguments?: object;
  call_id?: string;
  content?: any | LlmMessageContent[];
  id: string;
  name?: string;
  output?: any;
  role?: string;
  status?: number;
  type?: string;
  message?: string;
  tool_call?: ToolCall;
};

type AgentMessageProps = {
  msg: AgentMessageType;
};

const styles = {
  button_approve: {
    backgroundColor: 'green',
    color: 'white',
    marginRight: '10px',
    padding: '5px 10px',
    borderRadius: '5px',
    border: 'none',
  },
  button_reject: {
    backgroundColor: 'red',
    color: 'white',
    marginRight: '10px',
    padding: '5px 10px',
    borderRadius: '5px',
    border: 'none',
  },
  message_type: {
    fontSize: '12px',
    color: 'white',
    backgroundColor: 'green',
    padding: '2px 5px',
    borderRadius: '3px',
    display: 'inline-block',
    marginBottom: '5px',
  },
};

const AgentUserMessage = ({ msg }: AgentMessageProps) => {
  return (
    <div className={'conversation-item user'}>
      <div className={`speaker user`}></div>
      <div className={`speaker-content user`}>
        <div style={styles.message_type}>AgentUserMessage</div>
        <div>{msg?.content?.content?.toString() || JSON.stringify(msg)} </div>
        <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentApproveMessage = ({ msg }: AgentMessageProps) => {
  const [approveing, setApproveing] = useState<boolean>(false);

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        <div style={styles.message_type}>AgentApproveMessage</div>
        <h4>Please approve the tool call</h4>
        <p>Name: {msg?.content?.name}</p>
        <p>Status: {msg?.approve_status}</p>
        {msg?.content?.arguments && (
          <p>Arguments: {JSON.stringify(msg?.content?.arguments)}</p>
        )}
        <button
          style={{
            ...styles.button_approve,
            display: msg?.approve_status === 0 ? 'block-inline' : 'none',
          }}
          onClick={async () => {
            setApproveing(true);
            await approveMessage(msg.session_id, msg.id);
            setApproveing(false);
          }}
          disabled={msg?.approve_status !== 0 || approveing}
        >
          {approveing ? 'Approving...' : 'Approve'}
        </button>
        <button
          style={{
            ...styles.button_reject,
            display: msg?.approve_status === 0 ? 'block-inline' : 'none',
          }}
          onClick={async () => {
            setApproveing(true);
            await rejectMessage(msg.session_id, msg.id);
            setApproveing(false);
          }}
          disabled={msg?.approve_status !== 0 || approveing}
        >
          {approveing ? 'Rejecting...' : 'Reject'}
        </button>
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
        <div style={styles.message_type}>AgentUserOtherMessage</div>
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
        <div style={styles.message_type}>AgentAssistantOtherMessage</div>
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
        <div style={styles.message_type}>AgentUnknownMessage</div>
        {text && <Markdown>{text}</Markdown>}
        {!text && <MessageLoading messageId="msg_loading" />}
        <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentAssistantProgressMessage = ({ msg }: AgentMessageProps) => {
  const progress = msg?.content?.output?.progress;
  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        <div style={styles.message_type}>AgentAssistantProgressMessage</div>
        <p>Progress: {progress}</p>
        <Box sx={{ width: '300px', margin: '10px 0px' }}>
          <LinearProgress variant="buffer" value={progress} valueBuffer={1} />
        </Box>
        <ClickToJson msg={msg} />
      </div>
    </div>
  );
};

const AgentAssistantErrorMessage = ({ msg }: AgentMessageProps) => {
  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div
        className={`speaker-content assistant`}
        style={{ background: '#e46c6c' }}
      >
        <div style={styles.message_type}>AgentAssistantErrorMessage</div>
        <p>{JSON.stringify(msg.content)}</p>
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

  if (msg?.need_approve) {
    return <AgentApproveMessage msg={msg} />;
  }

  if (msg?.content?.output?.progress) {
    return <AgentAssistantProgressMessage msg={msg} />;
  }

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        <div style={styles.message_type}>AgentAssistantMessage</div>
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
        <div style={styles.message_type}>AgentCodeMessage</div>
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
        <div style={styles.message_type}>AgentWaitClientMessage</div>
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
    case 'assistant_error':
      return <AgentAssistantErrorMessage msg={msg} />;
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
