import { CapacitorConfig } from '@capacitor/cli';
import firebaseConfig from './firebase-applet-config.json';

const config: CapacitorConfig = {
  appId: 'com.tokboost.ai',
  appName: 'TokBoost AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    allowNavigation: [
      '*.firebaseapp.com', // Allows Firebase Auth redirect flow inside WebView
      firebaseConfig.authDomain || ''
    ]
  }
};

export default config;
