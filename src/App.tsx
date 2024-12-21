import { ConsolePage } from './pages/ConsolePage';
import './App.scss';
import { AppProvider } from './providers/AppProvider';
import LocalStorageViewer from './pages/LocalStorageViewer';
import Loading from './pages/Loading';
import { GptImagesProvider } from './contexts/GptImagesContext';
import { TrafficDataProvider } from './contexts/TrafficDataContext';
import { useEffect, useState } from 'react';

function App() {
  const [appKey, setAppKey] = useState<number>(1);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(1);
  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    if (background) {
      const path = isNightMode ? 'dark' : 'light';
      const url = `/images/bg/${path}/${background}.png`;
      document.body.style.backgroundImage = `url(${url})`;
    }
  }, [background]);

  return (
    <div data-component="App" key={appKey} style={{ opacity: opacity, background: background }}>
      <GptImagesProvider>
        <TrafficDataProvider>
          <AppProvider
            setAppKey={setAppKey}
            isNightMode={isNightMode}
            setIsNightMode={setIsNightMode}
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
