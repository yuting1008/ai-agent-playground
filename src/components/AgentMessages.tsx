import { useEffect, useRef, useState } from 'react';
import AgentMessage, { AgentLoadingMessage } from './AgentMessage';
import { CONNECT_CONNECTED } from '../lib/const';
import { lastAgentMessageIsUserMessage } from '../lib/helper';
import MessageLoading from './MessageLoading';

export default function AgentMessages({
  connectStatus,
  messages: messages,
}: {
  connectStatus: string;
  messages: any[];
}) {
  // automatically scroll to bottom of chat
  const messagesEndAgentRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollToBottom = () => {
    messagesEndAgentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [oldMessages, setOldMessages] = useState<any[]>([]);

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

        {lastAgentMessageIsUserMessage(messages) && <AgentLoadingMessage />}

        <div ref={messagesEndAgentRef} />
      </div>
    </>
  );
}
