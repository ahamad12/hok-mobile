import { EXPO_PUBLIC_API_HOST, EXPO_PUBLIC_APP_ENV } from '@env';
import Constants from 'expo-constants';

/** Loopback — only ever correct on the machine that owns it. */
function isLoopback(hostname: string): boolean {
  const h = hostname.replaceAll(/^\[|\]$/g, '');
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

/** RFC1918 LAN address — correct until DHCP hands this machine a new lease. */
function isPrivateLan(hostname: string): boolean {
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

/**
 * The LAN address Metro served this bundle from (e.g. "192.168.1.8:8081").
 * In dev this is the one address we KNOW the device can reach — it just
 * fetched the JS bundle over it — so it beats an IP hardcoded in .env that
 * goes stale every time the lease changes or Wi-Fi/Ethernet is swapped.
 * Returns null for tunnel mode (a domain) or when Metro exposes no host.
 */
function metroLanHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const hostname = hostUri
    .split('/')[0]
    .replace(/:\d+$/, '')
    .replaceAll(/^\[|\]$/g, '');
  return isPrivateLan(hostname) ? hostname : null;
}

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

  // Dev only: never rewrite a real domain (staging/prod/tunnel). A loopback or
  // private-LAN host in .env is a per-machine address, so prefer the address
  // Metro actually served this bundle from and keep the configured port.
  let host = parsed.host;
  if (__DEV__ && (isLoopback(parsed.hostname) || isPrivateLan(parsed.hostname))) {
    const metro = metroLanHost();
    if (metro) {
      host = parsed.port ? `${metro}:${parsed.port}` : metro;
    }
  }

  return `${parsed.protocol}//${host}`;
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
