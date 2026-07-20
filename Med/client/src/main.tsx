import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

// Capturar el evento de instalación de PWA lo antes posible (puede dispararse
// antes de que React monte). Se guarda en window para que el hook usePWAInstall
// lo recupere y muestre el botón "Instalar app".
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__deferredInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

window.addEventListener('appinstalled', () => {
  (window as any).__deferredInstallPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// StrictMode deshabilitado temporalmente para debug
ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
