import { createContext, useContext, Dispatch, useRef } from 'react';
import { GptImage, GptImageAction } from '../types/GptImage';
import { useImmerReducer } from 'use-immer';

const GptImagesContext = createContext<GptImage[]>([]);

const GptImagesDispatchContext = createContext<Dispatch<GptImageAction>>(() => {
  throw new Error('GptImagesDispatchContext not provided');
});

const initialGptImages: GptImage[] = [];

function gptImagesReducer(images: GptImage[], action: GptImageAction) {
  switch (action.type) {
    case 'add': {
      return [
        ...images,
        {
          prompt: action.gptImage.prompt,
          b64_json: action.gptImage.b64_json,
        },
      ];
    }

    case 'change': {
      return images.map((t) => {
        if (t.prompt === action.gptImage.prompt) {
          return action.gptImage;
        } else {
          return t;
        }
      });
    }

    case 'delete': {
      return images.filter((t) => t.prompt !== action.gptImage.prompt);
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function GptImagesProvider({ children }: { children: React.ReactNode }) {
  const [images, dispatch] = useImmerReducer(
    gptImagesReducer,
    initialGptImages,
  );

  return (
    <GptImagesContext.Provider value={images}>
      <GptImagesDispatchContext.Provider value={dispatch}>
        {children}
      </GptImagesDispatchContext.Provider>
    </GptImagesContext.Provider>
  );
}

export function useGptImages() {
  return useContext(GptImagesContext);
}

export function useGptImagesDispatch() {
  return useContext(GptImagesDispatchContext);
}

export function useGptImagesRef() {
  return useRef(useGptImages());
}
