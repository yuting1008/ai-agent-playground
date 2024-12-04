import { ConsolePage } from './pages/ConsolePage';
import './App.scss';
import { AppProvider } from './context/AppProvider';

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
