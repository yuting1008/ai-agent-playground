import { createContext, useContext, Dispatch } from 'react';
import { BellMessage, BellMessageAction } from '../types/BellMessage';
import { useImmerReducer } from 'use-immer';

const BellMessagesContext = createContext<BellMessage[]>([]);

const BellMessagesDispatchContext = createContext<Dispatch<BellMessageAction>>(
  () => {
    throw new Error('BellMessagesDispatchContext not provided');
  },
);

const initialBellMessages: BellMessage[] = [];

function bellMessagesReducer(images: BellMessage[], action: BellMessageAction) {
  switch (action.type) {
    case 'add': {
      return [
        ...images,
        {
          prompt: action.bellMessage.prompt,
          b64_json: action.bellMessage.b64_json,
        },
      ];
    }

    case 'change': {
      return images.map((t) => {
        if (t.prompt === action.bellMessage.prompt) {
          return action.bellMessage;
        } else {
          return t;
        }
      });
    }

    case 'delete': {
      return images.filter((t) => t.prompt !== action.bellMessage.prompt);
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function BellMessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [images, dispatch] = useImmerReducer(
    bellMessagesReducer,
    initialBellMessages,
  );

  return (
    <BellMessagesContext.Provider value={images}>
      <BellMessagesDispatchContext.Provider value={dispatch}>
        {children}
      </BellMessagesDispatchContext.Provider>
    </BellMessagesContext.Provider>
  );
}

export function useBellMessages() {
  return useContext(BellMessagesContext);
}

export function useBellMessagesDispatch() {
  return useContext(BellMessagesDispatchContext);
}
