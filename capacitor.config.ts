import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Confirm ownership and availability before the first store submission.
  appId: 'com.gamedle.app',
  appName: 'GameDLE',
  webDir: 'dist/game-dle-mobile/browser',
  experimental: {
    ios: {
      spm: {
        swiftToolsVersion: '6.1',
        packageOptions: {
          '@capacitor-firebase/analytics': {
            symlink: true,
          },
          '@capacitor-firebase/crashlytics': {
            symlink: true,
          },
        },
        packageTraits: {
          '@capacitor-firebase/analytics': ['AnalyticsWithoutAdIdSupport'],
        },
      },
    },
  },
  plugins: {
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: '#172019',
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#172019',
      style: 'LIGHT',
    },
  },
};

export default config;
