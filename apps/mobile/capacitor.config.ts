import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vione.app',
  appName: 'Vione Business Connect',
  webDir: 'www',
  server: {
    url: 'http://14.225.217.232:5000',
    cleartext: true
  }
};

export default config;
