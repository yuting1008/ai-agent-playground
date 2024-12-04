import { ConsolePage } from './ConsolePage';
import './App.scss';
import { AppProvider } from './AppProvider';

function App() {
  return (
    <div data-component="App">
      <AppProvider>
        <ConsolePage />
      </AppProvider>
    </div>
  );
}

export default App;
