import { fetch as fetchNetInfo } from '@react-native-community/netinfo';
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL } from '@/config/Environment';
import { ApiErrorData } from '@/constants/ApiErrors';
import { ApiResponse, unwrap } from '@/constants/ApiResponse';
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
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

/**
 * Authenticated instance. Every other domain call goes through this one.
 */
export const authedClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
// Fires when the session is provably dead (invalid/expired refresh token).
// Transient refresh failures (offline, timeout, 429, 5xx) never reach this —
// tokens are kept so the next attempt can retry. Registered by useInitAuth.
// ---------------------------------------------------------------------------
type AuthFailureHandler = () => void;
let onAuthFailure: AuthFailureHandler | null = null;

export function registerAuthFailureHandler(
  handler: AuthFailureHandler | null,
): void {
  onAuthFailure = handler;
}

async function forceSignOut(): Promise<void> {
  await TokenStorage.clearTokens();
  onAuthFailure?.();
}

// ---------------------------------------------------------------------------
// Token-refresh hook.
// Fired after a successful 401 rotation so the socket layer can re-handshake
// with the fresh access token (otherwise a long-lived socket keeps the
// pre-refresh token until the next network/AppState flap).
// ---------------------------------------------------------------------------
type TokenRefreshHandler = () => void;
let onTokensRefreshed: TokenRefreshHandler | null = null;

export function registerTokenRefreshHandler(
  handler: TokenRefreshHandler | null,
): void {
  onTokensRefreshed = handler;
}

// ---------------------------------------------------------------------------
// Single-flight 401 refresh-retry (authedClient only).
// Concurrent 401s queue behind one in-flight refresh call; on success every
// queued request retries with the new token; on fatal refresh failure every
// queued request re-rejects with ITS OWN original 401 (on transient failure
// the caller sees the refresh failure itself — see below). Tokens are
// wiped via forceSignOut ONLY when the refresh failure itself is fatal
// (400/401-class — see isFatalRefreshError); transient failures leave tokens
// intact for retry.
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

/**
 * Classifies a refresh-call failure. TRUE = the session itself is dead
 * (invalid/expired/unknown refresh token) → wipe tokens and sign out.
 * FALSE = transient (offline, timeout, 429, 5xx) → keep tokens intact so the
 * next attempt retries; the caller only sees a surfaced failure.
 * Inspects the REFRESH call's error, never the original 401 that triggered it.
 */
export function isFatalRefreshError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return true;
  }
  if (!error.response) {
    return false;
  }
  const status = error.response.status;
  if (status === 408 || status === 429 || status >= 500) {
    return false;
  }
  return true;
}

function setBearer(config: InternalAxiosRequestConfig, token: string): void {
  config.headers.set('Authorization', `Bearer ${token}`);
}

/**
 * The token this request was actually sent with, or null if it carried no
 * Authorization header. A 401 on a request that never carried a bearer
 * cannot be a stale-access-token 401, so it must not spend the refresh token.
 */
function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers.Authorization;
  return typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : null;
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

    // Only a missing/expired/invalid access token qualifies for refresh:
    // AUTHENTICATION_ERROR (tapt-api's 401 code for expired/invalid access —
    // confirmed against the backend error surface, see T1) or a schemaless
    // body (code undefined). Any other 401 body names its own cause and
    // belongs to the caller — refreshing on those would loop on the same
    // answer. A request that never carried a bearer can't be a
    // stale-access-token 401 either, so it's excluded too.
    const data = error.response?.data as ApiErrorData | undefined;
    const code = data?.error?.code;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      !(code === 'AUTHENTICATION_ERROR' || code === undefined) ||
      !bearerOf(originalRequest)
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

      const response = await unauthedClient.post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >(ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });
      const { accessToken, refreshToken: rotatedRefreshToken } =
        unwrap(response);

      // The session ended or changed (logout, re-login) while the refresh
      // was in flight: writing these tokens would resurrect the old session
      // or overwrite the new one. Fail this request without touching storage.
      if ((await TokenStorage.getRefreshToken()) !== refreshToken) {
        notifyRefreshWaiters(null);
        return Promise.reject(error);
      }

      await TokenStorage.setTokens(accessToken, rotatedRefreshToken);
      notifyRefreshWaiters(accessToken);
      onTokensRefreshed?.();

      setBearer(originalRequest, accessToken);
      return authedClient(originalRequest);
    } catch (refreshError) {
      notifyRefreshWaiters(null);
      if (isFatalRefreshError(refreshError)) {
        await forceSignOut();
        return Promise.reject(error);
      }
      // Transient refresh failure — tokens survive; the caller sees the
      // refresh failure itself (not the stale 401) so it can be classified
      // correctly upstream (e.g. boot restore keeps tokens for retry).
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
