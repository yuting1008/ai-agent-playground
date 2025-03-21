import { createContext, useContext, Dispatch } from 'react';
import { useImmerReducer } from 'use-immer';
import { TrafficData, TrafficDataAction } from '../types/TrafficData';

const initialTrafficData: TrafficData = {
  connectionLatency: [],
  connectionLatencyAvg: 0,
  connectionLatencyMin: 0,
  connectionLatencyMax: 0,
};

const TrafficDataContext = createContext<TrafficData>(initialTrafficData);

const TrafficDataDispatchContext = createContext<Dispatch<TrafficDataAction>>(
  () => {
    throw new Error('TrafficDataDispatchContext not provided');
  },
);

function trafficDataReducer(
  trafficData: TrafficData,
  action: TrafficDataAction,
) {
  switch (action.type) {
    case 'add': {
      return {
        ...trafficData,
        ...action.trafficData,
      };
    }

    case 'change': {
      return {
        ...trafficData,
        ...action.trafficData,
      };
    }

    case 'delete': {
      return initialTrafficData;
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function TrafficDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trafficData, dispatch] = useImmerReducer(
    trafficDataReducer,
    initialTrafficData,
  );

  return (
    <TrafficDataContext.Provider value={trafficData}>
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
