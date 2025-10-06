import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './style.css';
import App from './App';
import { AuthProvider } from './state/AuthContext';
import reportWebVitals from './reportWebVitals';

// If you place a background image in src/assets/download.jpeg it will be bundled
// and used as the app background. This script sets a CSS variable that the
// stylesheet reads (avoids webpack trying to resolve absolute paths in CSS).
// We attempt to load a bundled asset first; if that fails we set a runtime
// fallback that points to the public folder: /assets/download.jpeg.
let __bgSet = false;
try {
  // Require is used so bundlers will include the image if present
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const bg = require('./assets/download.jpeg');
  if (bg && typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--app-bg-image', `url(${bg})`);
    __bgSet = true;
  }
} catch (err) {
  // bundler did not include a local asset — we'll set a runtime fallback below
}

if (typeof document !== 'undefined' && !__bgSet) {
  // Runtime fallback: use the public folder asset. This avoids webpack
  // trying to resolve '/assets/download.jpeg' at build-time while still
  // allowing you to drop a file at public/assets/download.jpeg for quick testing.
  document.documentElement.style.setProperty('--app-bg-image', "url('/assets/download.jpeg')");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
