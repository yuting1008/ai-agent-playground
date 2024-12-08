import { createContext, useContext, Dispatch } from 'react';
import { useImmerReducer } from 'use-immer';
import { TrafficData, TrafficDataAction } from '../types/TrafficData';

const TrafficDataContext = createContext<TrafficData[]>([]);

const TrafficDataDispatchContext = createContext<Dispatch<TrafficDataAction>>(() => {
  throw new Error('TrafficDataDispatchContext not provided');
});

const initialTrafficData: TrafficData[] = [];

function trafficDataReducer(images: TrafficData[], action: TrafficDataAction) {
  switch (action.type) {

    case 'add': {
      return [...images, {
        prompt: action.trafficData.prompt,
        b64_json: action.trafficData.b64_json
      }];
    }

    case 'change': {
      return images.map(t => {
        if (t.prompt === action.trafficData.prompt) {
          return action.trafficData;
        } else {
          return t;
        }
      });
    }

    case 'delete': {
      return images.filter(t => t.prompt !== action.trafficData.prompt);
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function TrafficDataProvider({ children }: { children: React.ReactNode }) {

  const [images, dispatch] = useImmerReducer(
    trafficDataReducer,
    initialTrafficData
  );

  return (
    <TrafficDataContext.Provider value={images}>
      <TrafficDataDispatchContext.Provider value={dispatch}>
        {children}
      </TrafficDataDispatchContext.Provider>
    </TrafficDataContext.Provider>
  );
}

export function useTrafficData() {
  return useContext(TrafficDataContext);
}

export function useTrafficDataDispatch() {
  return useContext(TrafficDataDispatchContext);
}
