import Markdown from 'react-markdown';
import { ASSISTENT_TYPE_DEEPSEEK, ASSISTENT_TYPE_DEFAULT } from '../lib/const';

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
  const think = text.slice(thinkStart + 7, thinkEnd);
  const nonThink = text.slice(0, thinkStart) + text.slice(thinkEnd + 8);
  return {
    think,
    nonThink,
  };
}

const AssistantAssistantMessage = ({ text }: { text: string }) => {
  const isDeepSeek =
    localStorage.getItem('assistantType') === ASSISTENT_TYPE_DEEPSEEK;

  if (isDeepSeek) {
    const { think, nonThink } = parseDeepSeekText(text);
    return (
      <div className={'conversation-item assistant'}>
        <div className={`speaker deepseek`}></div>
        <div className={`speaker-content assistant`}>
          {think && <p style={{ fontStyle: 'italic' }}>{think}</p>}
          {think && nonThink && <hr style={{ margin: '10px 0' }} />}
          {nonThink && <Markdown>{nonThink}</Markdown>}
        </div>
      </div>
    );
  }

  return (
    <div className={'conversation-item assistant'}>
      <div className={`speaker assistant`}></div>
      <div className={`speaker-content assistant`}>
        <Markdown>{text}</Markdown>
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
