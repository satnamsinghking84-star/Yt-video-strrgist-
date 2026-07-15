import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import OAuthProxy from './components/OAuthProxy.tsx';
import './index.css';

// Intercept Google Sheets OAuth callback in popup
if (window.location.hash && window.location.hash.includes('access_token=')) {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const token = params.get('access_token');
  if (token) {
    if (window.opener) {
      window.opener.postMessage({ type: 'GOOGLE_SHEETS_OAUTH_SUCCESS', accessToken: token }, '*');
    }
    localStorage.setItem('google_sheets_token_temp', token);
  }
  window.close();
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('oauth_proxy') === 'true') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <OAuthProxy />
    </StrictMode>
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

