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
  ASSISTANT_TYPE_ASSISTANT,
  ASSISTANT_TYPE_DEEPSEEK,
  ASSISTANT_TYPE_DEFAULT,
  ASSISTANT_TYPE_REALTIME,
  ASSISTANT_TYPES,
} from '../lib/const';
import { AlertTriangle } from 'react-feather';
import AboutApp from '../components/AboutApp';
import { ConsolePageDeepSeek } from './ConsolePageDeepSeek';
import GithubLink from '../components/GithubLink';
import {
  getAppName,
  getFunctionsFromUrl,
  getPromptFromUrl,
} from '../lib/helper';
import { useEffect, useState } from 'react';
import AppMessage from '../components/AppMessage';
import { supportedAssistantTypes } from '../components/Settings';
import defaultIcon from '../static/logomark.svg';
export function ConsolePage() {
  const { isDebugMode, setIsDebugMode, isNightMode } = useContexts();
  const [appName] = useState(getAppName());

  const [appIconDark, setAppIconDark] = useState(
    localStorage.getItem('appIconDark') || defaultIcon,
  );

  const [appIconLight, setAppIconLight] = useState(
    localStorage.getItem('appIconLight') || defaultIcon,
  );

  let assistantType =
    localStorage.getItem('assistantType') || ASSISTANT_TYPE_DEFAULT;

  if (!ASSISTANT_TYPES.includes(assistantType)) {
    assistantType = ASSISTANT_TYPE_DEFAULT;
  }

  const isAssistant = assistantType === ASSISTANT_TYPE_ASSISTANT;
  const isRealtime = assistantType === ASSISTANT_TYPE_REALTIME;
  const isDeepSeek = assistantType === ASSISTANT_TYPE_DEEPSEEK;

  const supportedAssistantType = supportedAssistantTypes.find(
    (type) => type.value === assistantType,
  );

  useEffect(() => {
    const timer = setInterval(async () => {
      await getPromptFromUrl();
      await getFunctionsFromUrl();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = appName;
  }, [appName]);

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

  const styles = {
    assistantType: {
      fontSize: '10px',
      color: 'white',
      backgroundColor: 'green',
      borderRadius: '5px',
      padding: '3px 6px',
      marginLeft: '0',
      marginTop: '-5px',
    },
    title: {
      fontSize: '30px',
      fontWeight: '500',
    },
    logo: {
      height: '40px',
    },
  };

  /**
   * Render the application
   */
  return (
    <div data-component="ConsolePage">
      <Caption />

      <div className="content-top">
        <div className="content-title">
          <img
            style={styles.logo}
            src={isNightMode ? appIconDark : appIconLight}
            alt="logo"
          />
          <h1 style={styles.title}>{appName}</h1>
          <span style={styles.assistantType}>
            {supportedAssistantType?.label}
          </span>
          <a
            href="https://github.com/theodoreniu/ai-agent-playground"
            target="_blank"
            style={{ marginTop: 0, top: 0, display: 'none' }}
          >
            <img
              src="https://img.shields.io/github/v/tag/theodoreniu/ai-agent-playground"
              style={{ width: '100%', height: '20px' }}
              alt="logo"
            />
          </a>
        </div>
        <span className="functions">
          <BingSearchResult />
          <TrafficMonitor />
          <PaintingResult />
          <IsDebugMode />
          <NightMode />
          <FunctionsList />
          <AppMessage />
          <GithubLink />
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
