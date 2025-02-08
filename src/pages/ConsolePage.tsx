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
  ASSISTENT_TYPE_DEEPSEEK,
  ASSISTENT_TYPE_DEFAULT,
  ASSISTENT_TYPE_REALTIME,
} from '../lib/const';
import { AlertTriangle } from 'react-feather';
import AboutApp from '../components/AboutApp';
import { ConsolePageDeepSeek } from './ConsolePageDeepSeek';

export function ConsolePage() {
  const { setIsNightMode, isDebugMode, setIsDebugMode } = useContexts();

  const assistantType =
    localStorage.getItem('assistantType') || ASSISTENT_TYPE_DEFAULT;
  const isAssistant = assistantType === ASSISTENT_TYPE_ASSISTANT;
  const isRealtime = assistantType === ASSISTENT_TYPE_REALTIME;
  const isDeepSeek = assistantType === ASSISTENT_TYPE_DEEPSEEK;

  function IsDebugMode() {
    if (!isDebugMode) {
      return null;
    }

    return (
      <span onClick={() => setIsDebugMode(false)}>
        <AlertTriangle />
      </span>
    );
  }

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 || hour < 6) {
      setIsNightMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <p style={{ marginTop: 0, top: 0 }}>2025.2.8</p>
        </div>
        <span className="functions">
          <BingSearchResult />
          <TrafficMonitor />
          <PaintingResult />
          <IsDebugMode />
          <NightMode />
          <FunctionsList />
          <AboutApp />
        </span>
      </div>

      <div className="content-main">
        {isRealtime && <ConsolePageRealtime />}
        {isAssistant && <ConsolePageAssistant />}
        {isDeepSeek && <ConsolePageDeepSeek />}
      </div>
    </div>
  );
}
