import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.hyka.DuctiFact',
  appName: 'DuctiFact',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Native,
    },
  },
};

export default config;
