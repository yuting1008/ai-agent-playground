import { useEffect, useRef, useState } from 'react';
import AgentMessage, {
  AgentLoadingMessage,
  AgentWaitClientMessage,
} from './AgentMessage';
import { CONNECT_CONNECTED } from '../lib/const';
import {
  agentMessageNeedLoading,
  agentMessageNeedWaitClient,
} from '../lib/helper';
import { AgentMessageType } from '../types/AgentMessageType';

export default function AgentMessages({
  connectStatus,
  messages: messages,
}: {
  connectStatus: string;
  messages: AgentMessageType[];
}) {
  // automatically scroll to bottom of chat
  const messagesEndAgentRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollToBottom = () => {
    messagesEndAgentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [oldMessages, setOldMessages] = useState<AgentMessageType[]>([]);

  useEffect(() => {
    // assistantScrollToBottom if messages is updated
    if (oldMessages.length !== messages.length) {
      assistantScrollToBottom();
    }
    setOldMessages(messages);
  }, [messages, oldMessages]);

  if (connectStatus !== CONNECT_CONNECTED) {
    return null;
  }

  return (
    <>
      <div>
        {messages.map((msg, index) => (
          <AgentMessage key={index} msg={msg} />
        ))}

        {agentMessageNeedWaitClient(messages) && <AgentWaitClientMessage />}

        {!agentMessageNeedWaitClient(messages) &&
          agentMessageNeedLoading(messages) && <AgentLoadingMessage />}

        <div ref={messagesEndAgentRef} />
      </div>
    </>
  );
}
