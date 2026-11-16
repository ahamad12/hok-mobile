module.exports = ({ config }) => {
  const environment = process.env.EXPO_PUBLIC_APP_ENV || 'production';

  const envSpecificConfig = {
    development: {
      name: 'Hok Dev',
      bundleIdentifier: 'com.tapt.mobile.dev',
      scheme: 'tapt-dev',
    },
    staging: {
      name: 'Hok Staging',
      bundleIdentifier: 'com.tapt.mobile.staging',
      scheme: 'tapt-staging',
    },
    qa: {
      name: 'Hok QA',
      bundleIdentifier: 'com.tapt.mobile.qa',
      scheme: 'tapt-qa',
    },
    production: {
      name: 'Hok',
      bundleIdentifier: 'com.tapt.mobile',
      scheme: 'tapt',
    },
  };

  const envConfig = (() => {
    switch (environment) {
      case 'development':
        return envSpecificConfig.development;
      case 'staging':
        return envSpecificConfig.staging;
      case 'qa':
        return envSpecificConfig.qa;
      case 'production':
      default:
        return envSpecificConfig.production;
    }
  })();

  return {
    ...config,
    name: envConfig.name,
    slug: 'tapt-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: envConfig.scheme,
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#121210',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: envConfig.bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#121210',
      },
      edgeToEdgeEnabled: true,
      package: envConfig.bundleIdentifier,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      '@sentry/react-native',
      'expo-localization',
      'expo-status-bar',
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow TAPT to attach supplier bills from your photos.',
          cameraPermission: 'Allow TAPT to photograph supplier bills.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '',
      },
    },
    updates: {
      url: '',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    owner: '',
  };
};
