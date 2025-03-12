import { ConsolePage } from './pages/ConsolePage';
import './App.scss';
import { AppProvider } from './providers/AppProvider';
import LocalStorageViewer from './pages/LocalStorageViewer';
import Loading from './pages/Loading';
import { GptImagesProvider } from './contexts/GptImagesContext';
import { TrafficDataProvider } from './contexts/TrafficDataContext';
import { useEffect, useState } from 'react';
import { ToolDefinitionType } from '@theodoreniu/realtime-api-beta/dist/lib/client';
import { loadFunctions } from './lib/helper';

function App() {
  const [appKey, setAppKey] = useState<number>(1);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(1);
  const [background, setBackground] = useState<string>('');
  const [loadFunctionsTool] =
    useState<[ToolDefinitionType, Function][]>(loadFunctions());

  useEffect(() => {
    if (background) {
      const path = isNightMode ? 'dark' : 'light';
      const url = `/images/bg/${path}/${background}.png`;
      document.body.style.backgroundImage = `url(${url})`;
    }
  }, [background, isNightMode]);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 || hour < 6) {
      setIsNightMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-component="App" key={appKey} style={{ opacity: opacity }}>
      <GptImagesProvider>
        <TrafficDataProvider>
          <AppProvider
            appKey={appKey}
            setAppKey={setAppKey}
            isNightMode={isNightMode}
            setIsNightMode={setIsNightMode}
            loadFunctionsTool={loadFunctionsTool}
            setOpacity={setOpacity}
            setBackground={setBackground}
          >
            <Loading />
            <LocalStorageViewer />
            <ConsolePage />
          </AppProvider>
        </TrafficDataProvider>
      </GptImagesProvider>
    </div>
  );
}

export default App;
