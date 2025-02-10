import Markdown from 'react-markdown';
import { ASSISTENT_TYPE_DEEPSEEK } from '../lib/const';
import MessageLoading from './MessageLoading';

type AssistantMessageProps = {
  role: 'user' | 'assistant' | 'code';
  text: string;
};

const AssistantUserMessage = ({ text }: { text: string }) => {
  return (
    <div className={'conversation-item user'}>
      <div className={`speaker user`}></div>
      <div className={`speaker-content user`}>{text}</div>
    </div>
  );
};

function parseDeepSeekText(text: string) {
  const thinkStart = text.indexOf('<think>');
  const thinkEnd = text.indexOf('</think>');
  if (thinkStart === -1) {
    return {
      think: text.replace('<think>', `Thinking...\n`),
      nonThink: '',
    };
  }
  if (thinkEnd === -1) {
    return {
      think: text.replace('<think>', `Thinking...\n`),
      nonThink: '',
    };
  }
  const think = text
    .slice(thinkStart + 7, thinkEnd)
    .trim()
    .replaceAll('<think>', '')
    .replaceAll('</think>', '');

  const nonThink =
    text.slice(0, thinkStart) +
    text
      .slice(thinkEnd + 8)
      .trim()
      .replaceAll('<think>', '')
      .replaceAll('</think>', '');

  return {
    think,
    nonThink,
  };
}

const AssistantAssistantMessage = ({ text }: { text: string }) => {
  text = text.trim();
  const isDeepSeek =
    localStorage.getItem('assistantType') === ASSISTENT_TYPE_DEEPSEEK;

  if (isDeepSeek) {
    const { think, nonThink } = parseDeepSeekText(text);
    return (
      <div className={'conversation-item assistant'}>
        <div className={`speaker deepseek`}></div>
        <div className={`speaker-content assistant`}>
          {think && (
            <p
              style={{
                fontStyle: 'italic',
                backgroundColor: '#f2f2f2',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                borderLeft: '4px solid #d2d2d2',
              }}
            >
              {think}
            </p>
          )}
          {nonThink && <Markdown>{nonThink}</Markdown>}
          {!think && !nonThink && <MessageLoading messageId="msg_loading" />}
        </div>
      </div>
    );
  }

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

const AssistantCodeMessage = ({ text }: { text: string }) => {
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

export default function AssistantMessage({
  role,
  text,
}: AssistantMessageProps) {
  switch (role) {
    case 'user':
      return <AssistantUserMessage text={text} />;
    case 'assistant':
      return <AssistantAssistantMessage text={text} />;
    case 'code':
      return <AssistantCodeMessage text={text} />;
    default:
      return null;
  }
}
