import { useEffect } from 'react';

import './ConsolePage.scss';
import { useContexts } from '../providers/AppProvider';
import { NightMode } from '../components/NightMode';
import Caption from '../components/Caption';
import BingSearchResult from '../components/functions/BingSearchResult';
import PaintingResult from '../components/functions/PaintingResult';
import TrafficMonitor from '../components/functions/TrafficMonitor';
import FunctionsList from '../components/functions/FunctionsList';
import { ConsolePageRealtime } from './ConsolePageRealtime';
import { ConsolePageAssistant } from './ConsolePageAssistant';
import {
  ASSISTENT_TYPE_ASSISTANT,
  ASSISTENT_TYPE_DEFAULT,
  ASSISTENT_TYPE_REALTIME,
} from '../lib/const';

export function ConsolePage() {
  const { setIsNightMode } = useContexts();

  const assistantType =
    localStorage.getItem('assistantType') || ASSISTENT_TYPE_DEFAULT;
  const isAssistant = assistantType === ASSISTENT_TYPE_ASSISTANT;
  const isRealtime = assistantType === ASSISTENT_TYPE_REALTIME;

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 || hour < 6) {
      setIsNightMode(true);
    }
  }, []);

  /**
   * Render the application
   */
  return (
    <div data-component="ConsolePage">
      <Caption />

      <div className="content-top">
        <div className="content-title">
          <img src="/logomark.svg" alt="logo" />
          <h1>AI Agent Playground</h1>
        </div>
        <span className="functions">
          <BingSearchResult />
          <TrafficMonitor />
          <FunctionsList />
          <PaintingResult />
          <NightMode />
        </span>
      </div>

      <div className="content-main">
        {isRealtime && <ConsolePageRealtime />}
        {isAssistant && <ConsolePageAssistant />}
      </div>
    </div>
  );
}
