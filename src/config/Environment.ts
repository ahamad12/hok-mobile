import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_APP_ENV } from '@env';

interface IEnvironment {
  appEnv: string;
  apiUrl: string;
  debug: boolean;
}

const Environment: IEnvironment = {
  debug: __DEV__,
  appEnv: EXPO_PUBLIC_APP_ENV,
  apiUrl: EXPO_PUBLIC_API_URL,
};

export default Environment;
