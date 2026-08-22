import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'connect.vn.unibusiness',
  appName: 'uniBusiness',
  webDir: '.output/public',
  server: {
    cleartext: true
  }
};

export default config;
