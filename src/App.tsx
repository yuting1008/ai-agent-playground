import { ConsolePage } from './pages/ConsolePage';
import './App.scss';
import { AppProvider } from './providers/AppProvider';
import { SettingsProvider } from './providers/SettingsProvider';
import { AssistantProvider } from './providers/AssistantProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import LocalStorageViewer from './pages/LocalStorageViewer';
import Loading from './pages/Loading';
import { GptImagesProvider } from './contexts/GptImagesContext';
import { TrafficDataProvider } from './contexts/TrafficDataContext';

function App() {
  return (
    <div data-component="App">
      <SettingsProvider>
        <GptImagesProvider>
          <TrafficDataProvider>
            <AppProvider>
              <AssistantProvider>
                <RealtimeProvider>
                  <Loading />
                  <LocalStorageViewer />
                  <ConsolePage />
                </RealtimeProvider>
              </AssistantProvider>
            </AppProvider>
          </TrafficDataProvider>
        </GptImagesProvider>
      </SettingsProvider>
    </div>
  );
}

export default App;
