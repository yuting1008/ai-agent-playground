import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

function ErrorComponent() {
  throw new Error('This is a test error');
  return <div>ErrorComponent</div>;
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* <ErrorComponent /> */}
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

reportWebVitals();
