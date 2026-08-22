import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vione.app',
  appName: 'Vione Business Connect',
  webDir: '.output/public',
  server: {
    url: 'http://192.168.88.145:8080',
    cleartext: true
  }
};

export default config;
