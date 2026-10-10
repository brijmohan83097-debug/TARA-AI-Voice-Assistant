import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register PWA Service Worker for offline capability & installability
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[TARA PWA] Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[TARA PWA] Service Worker registration failed:', error);
      });
  });
}
