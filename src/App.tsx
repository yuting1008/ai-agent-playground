import { ConsolePage } from './pages/ConsolePage';
import './App.scss';
import { AppProvider } from './providers/AppProvider';
import LocalStorageViewer from './pages/LocalStorageViewer';
import Loading from './pages/Loading';
import { GptImagesProvider } from './contexts/GptImagesContext';
import { TrafficDataProvider } from './contexts/TrafficDataContext';
import { useState } from 'react';

function App() {
  const [appKey, setAppKey] = useState<number>(1);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);

  return (
    <div data-component="App" key={appKey}>
      <GptImagesProvider>
        <TrafficDataProvider>
          <AppProvider
            setAppKey={setAppKey}
            isNightMode={isNightMode}
            setIsNightMode={setIsNightMode}
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
