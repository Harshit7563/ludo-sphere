import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/rush.css';
import './styles/game.css';
import './styles/mobile.css';
import './styles/auth.css';
import './styles/head-tail.css';
import './styles/logo.css';

import { Capacitor } from '@capacitor/core';

const isNativeApp =
  import.meta.env.VITE_CAPACITOR === 'true' || Capacitor.isNativePlatform();

if (isNativeApp) {
  document.documentElement.classList.add('native-app');
}

if (isNativeApp) {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0a0a0f' });
  }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
