import { EXPO_PUBLIC_API_HOST, EXPO_PUBLIC_APP_ENV } from '@env';

function resolveApiHost(): string {
  const raw = (EXPO_PUBLIC_API_HOST ?? '').trim().replace(/\/+$/, '');

  if (!raw) {
    throw new Error(
      '[Environment] Missing EXPO_PUBLIC_API_HOST — set a bare host (e.g. https://api.example.com) via .env / EAS env. /api/v1 is appended in code, never in env.',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `[Environment] Invalid EXPO_PUBLIC_API_HOST "${raw}" — must be a valid http(s) URL, bare host with no path (e.g. https://api.example.com).`,
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `[Environment] Invalid EXPO_PUBLIC_API_HOST "${raw}" — protocol must be http or https.`,
    );
  }

  if (parsed.pathname && parsed.pathname !== '/') {
    throw new Error(
      `[Environment] Invalid EXPO_PUBLIC_API_HOST "${raw}" — must be a bare host with no path (got "${parsed.pathname}"). Put /api/v1 in code, not env.`,
    );
  }

  return `${parsed.protocol}//${parsed.host}`;
}

const apiHost = resolveApiHost();

interface IEnvironment {
  appEnv: string;
  apiUrl: string;
  debug: boolean;
}

const Environment: IEnvironment = {
  debug: __DEV__,
  appEnv: EXPO_PUBLIC_APP_ENV,
  apiUrl: apiHost,
};

/** Base URL for every REST call — host + version prefix. */
export const API_BASE_URL = `${apiHost}/api/v1`;

/** Bare-host URL for the socket.io handshake (no /api/v1 path). */
export const SOCKET_URL = apiHost;

export default Environment;
