import { fetch as fetchNetInfo } from '@react-native-community/netinfo';
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import Environment from '@/config/Environment';
import { NetworkStatus } from '@/constants/AppConstants';
import { ENDPOINTS } from '@/constants/Endpoints';
import { debouncedNoInternetHandler } from '@/utils/NetworkManager';

import { TokenStorage } from './TokenStorage';

const REQUEST_TIMEOUT_MS = 20000;

/**
 * Unauthenticated instance.
 * Use ONLY for login, register, refresh. No auth header, no response
 * interceptor — deliberately loop-proof against the 401-refresh logic below.
 */
export const unauthedClient: AxiosInstance = axios.create({
  baseURL: Environment.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
});

/**
 * Authenticated instance. Every other domain call goes through this one.
 */
export const authedClient: AxiosInstance = axios.create({
  baseURL: Environment.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
});

// ---------------------------------------------------------------------------
// Shared request-time guard.
// Reports connectivity to the debounced network store on every request (so
// the offline banner and useSocketConnection stay accurate — same behavior
// as the former Api.ts request interceptor), then blocks the request if offline.
// ---------------------------------------------------------------------------
async function assertOnline(): Promise<void> {
  const state = await fetchNetInfo();
  const status = state.isConnected
    ? NetworkStatus.ONLINE
    : NetworkStatus.OFFLINE;
  debouncedNoInternetHandler(status);

  if (!state.isConnected) {
    const offlineError = new AxiosError('No network connection');
    offlineError.code = 'ERR_NETWORK';
    throw offlineError;
  }
}

unauthedClient.interceptors.request.use(async (config) => {
  await assertOnline();
  config.headers['Content-Type'] = 'application/json';
  return config;
});

authedClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    await assertOnline();
    const accessToken = await TokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
);

// ---------------------------------------------------------------------------
// Forced-logout hook.
// No login screen exists yet, so this module never navigates — it only
// clears tokens and notifies whoever has registered a handler. Wire the
// auth slice's signOut() here once it exists.
// ---------------------------------------------------------------------------
type AuthFailureHandler = () => void;
let onAuthFailure: AuthFailureHandler | null = null;

export function registerAuthFailureHandler(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

async function forceSignOut(): Promise<void> {
  await TokenStorage.clearTokens();
  onAuthFailure?.();
}

// ---------------------------------------------------------------------------
// Single-flight 401 refresh-retry (authedClient only).
// Concurrent 401s queue behind one in-flight refresh call; on success every
// queued request retries with the new token; on failure every queued request
// re-rejects with ITS OWN original 401 (not the refresh error), and tokens
// are wiped once via forceSignOut.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function subscribeToRefresh(cb: (token: string | null) => void): void {
  refreshWaiters.push(cb);
}

function notifyRefreshWaiters(token: string | null): void {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
};

function setBearer(config: InternalAxiosRequestConfig, token: string): void {
  config.headers.set('Authorization', `Bearer ${token}`);
}

authedClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Mid-request network drop — report OFFLINE and bail out before any
    // 401/refresh logic.
    if (error.code === 'ERR_CANCELED' || error.code === 'ERR_NETWORK') {
      debouncedNoInternetHandler(NetworkStatus.OFFLINE);
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest._retried = true;
          setBearer(originalRequest, newToken);
          resolve(authedClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    originalRequest._retried = true;

    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw error;
      }

      const { data } = await unauthedClient.post(ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });
      const { accessToken, refreshToken: rotatedRefreshToken } = data;

      await TokenStorage.setTokens(accessToken, rotatedRefreshToken);
      notifyRefreshWaiters(accessToken);

      setBearer(originalRequest, accessToken);
      return authedClient(originalRequest);    } catch {
      notifyRefreshWaiters(null);
      await forceSignOut();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
