import { ConsolePage } from './ConsolePage';
import './App.scss';
import { AppProvider } from './providers/AppProvider';
import { SettingsProvider } from './providers/SettingsProvider';
import { AssistantProvider } from './providers/AssistantProvider';
import { AvatarProvider } from './providers/AvatarProvider';
import { SttProvider } from './providers/SttProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';

function App() {
  return (
    <div data-component="App">
      <SettingsProvider>
        <AppProvider>
          <AvatarProvider>
            <AssistantProvider>
              <SttProvider>
                <RealtimeProvider>
                  <ConsolePage />
                </RealtimeProvider>
              </SttProvider>
            </AssistantProvider>
          </AvatarProvider>
        </AppProvider>
      </SettingsProvider>
    </div>
  );
}

export default App;
