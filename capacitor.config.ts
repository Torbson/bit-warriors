import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bitwarriors.game',
  appName: 'Bit Warriors',
  webDir: 'dist',
  server: { androidScheme: 'https' },
};

export default config;
