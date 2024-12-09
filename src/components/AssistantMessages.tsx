import { useEffect, useRef } from 'react';
import AssistantMessage from './AssistantMessage';
import { CONNECT_CONNECTED } from '../lib/const';

export default function AssistantMessages({
  connectStatus,
  messagesAssistant,
}: {
  connectStatus: string;
  messagesAssistant: any[];
}) {
  // automatically scroll to bottom of chat
  const messagesEndAssistantRef = useRef<HTMLDivElement | null>(null);
  const assistantScrollToBottom = () => {
    messagesEndAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    assistantScrollToBottom();
  }, [messagesAssistant]);

  if (connectStatus !== CONNECT_CONNECTED) {
    return null;
  }

  return (
    <>
      <div>
        {messagesAssistant.map((msg, index) => (
          <AssistantMessage key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndAssistantRef} />
      </div>
    </>
  );
}
