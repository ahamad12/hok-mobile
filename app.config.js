module.exports = ({ config }) => {
  const environment = process.env.EXPO_PUBLIC_APP_ENV || 'production';

  const envSpecificConfig = {
    development: {
      name: 'YourApp Dev',
      bundleIdentifier: 'com.yourcompany.yourapp.dev',
      scheme: 'yourapp-dev',
    },
    staging: {
      name: 'YourApp Staging',
      bundleIdentifier: 'com.yourcompany.yourapp.staging',
      scheme: 'yourapp-staging',
    },
    qa: {
      name: 'YourApp QA',
      bundleIdentifier: 'com.yourcompany.yourapp.qa',
      scheme: 'yourapp-qa',
    },
    production: {
      name: 'YourApp',
      bundleIdentifier: 'com.yourcompany.yourapp',
      scheme: 'yourapp',
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
    slug: 'expo-starter-template',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: envConfig.scheme,
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
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
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: envConfig.bundleIdentifier,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router'],
    extra: {
      eas: {
        projectId: 'eee45be2-c7fb-40c0-8e3a-a938d605b6fd',
      },
    },
    updates: {
      url: 'https://u.expo.dev/eee45be2-c7fb-40c0-8e3a-a938d605b6fd',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    owner: 'vezzo',
  };
};
