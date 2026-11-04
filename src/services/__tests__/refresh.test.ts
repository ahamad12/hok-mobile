import { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';

const PROTECTED = 'test/ping';

// The react-native-dotenv babel plugin inlines EXPO_PUBLIC_* at transform
// time (before jest.setup can set them, and invisibly to babel-jest's cache
// key), so stub the Environment module instead of depending on env.
jest.mock('@/config/Environment', () => ({
  __esModule: true,
  default: {
    appEnv: 'test',
    apiUrl: 'https://test.example',
    debug: false,
  },
  API_BASE_URL: 'https://test.example/api/v1',
  SOCKET_URL: 'https://test.example',
}));

// NetworkManager pulls `@/store → i18n → expo-localization` (native ESM,
// unloadable under jest). httpClient only uses `debouncedNoInternetHandler`
// from it, so stub the module boundary instead of the native chain.
jest.mock('@/utils/NetworkManager', () => ({
  __esModule: true,
  debouncedNoInternetHandler: jest.fn(),
}));

// Fresh module registry per test — httpClient carries single-flight state
// (isRefreshing/waiters) that must not leak between cases.
let authedClient: typeof import('@/services/httpClient').authedClient;
let unauthedClient: typeof import('@/services/httpClient').unauthedClient;
let isFatalRefreshError: typeof import('@/services/httpClient').isFatalRefreshError;
let registerAuthFailureHandler: typeof import('@/services/httpClient').registerAuthFailureHandler;
let TokenStorage: typeof import('@/services/TokenStorage').TokenStorage;
let ENDPOINTS: typeof import('@/constants/Endpoints').ENDPOINTS;

beforeEach(() => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require('expo-secure-store');
  SecureStore.__clear();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const httpClient = require('@/services/httpClient');
  ({ authedClient, unauthedClient, isFatalRefreshError } = httpClient);
  ({ registerAuthFailureHandler } = httpClient);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ({ TokenStorage } = require('@/services/TokenStorage'));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ({ ENDPOINTS } = require('@/constants/Endpoints'));
});

async function seedTokens() {
  await TokenStorage.setTokens('expired-access', 'valid-refresh');
}

describe('isFatalRefreshError (Step 8 split)', () => {
  it('treats 400/401 as dead sessions', async () => {
    await seedTokens();
    const mock = new MockAdapter(unauthedClient);
    mock.onPost(ENDPOINTS.AUTH.REFRESH).reply(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'bad token' },
    });
    await expect(
      unauthedClient.post(ENDPOINTS.AUTH.REFRESH, {
        refreshToken: 'valid-refresh',
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });
    // Classify the failure the same way the interceptor does:
    try {
      await unauthedClient.post(ENDPOINTS.AUTH.REFRESH, {
        refreshToken: 'valid-refresh',
      });
      throw new Error('should have thrown');
    } catch (error) {
      expect(isFatalRefreshError(error)).toBe(true);
    }
  });

  it('treats network/timeout/429/5xx as transient', () => {
    // Genuine AxiosErrors: no response = never reached the server.
    expect(isFatalRefreshError(new AxiosError('net', 'ERR_NETWORK'))).toBe(
      false,
    );
    expect(isFatalRefreshError(new AxiosError('t/o', 'ECONNABORTED'))).toBe(
      false,
    );
    const withStatus = (status: number) =>
      new AxiosError(`http ${status}`, String(status), undefined, undefined, {
        status,
      } as never);
    expect(isFatalRefreshError(withStatus(429))).toBe(false);
    expect(isFatalRefreshError(withStatus(500))).toBe(false);
    expect(isFatalRefreshError(withStatus(503))).toBe(false);
    // …while client errors from the refresh endpoint mean a dead session.
    expect(isFatalRefreshError(withStatus(400))).toBe(true);
    expect(isFatalRefreshError(withStatus(401))).toBe(true);
  });
});

describe('401 refresh-retry interceptor (Step 8)', () => {
  it('keeps tokens on refresh 500 and surfaces the refresh failure', async () => {
    await seedTokens();
    const onAuthFailure = jest.fn();
    registerAuthFailureHandler(onAuthFailure);

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).reply(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'expired' },
    });
    unauthedMock.onPost(ENDPOINTS.AUTH.REFRESH).reply(500, {
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'boom' },
    });

    await expect(authedClient.get(PROTECTED)).rejects.toMatchObject({
      response: { status: 500 },
    });

    // Transient failure: tokens survive, no forced sign-out.
    expect(await TokenStorage.getRefreshToken()).toBe('valid-refresh');
    expect(await TokenStorage.getAccessToken()).toBe('expired-access');
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('keeps tokens on refresh timeout', async () => {
    await seedTokens();
    const onAuthFailure = jest.fn();
    registerAuthFailureHandler(onAuthFailure);

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).reply(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'expired' },
    });
    unauthedMock.onPost(ENDPOINTS.AUTH.REFRESH).timeout();

    await expect(authedClient.get(PROTECTED)).rejects.toMatchObject({
      code: 'ECONNABORTED',
    });

    expect(await TokenStorage.getRefreshToken()).toBe('valid-refresh');
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('wipes tokens on refresh 401 (dead session)', async () => {
    await seedTokens();
    const onAuthFailure = jest.fn();
    registerAuthFailureHandler(onAuthFailure);

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).reply(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'expired' },
    });
    unauthedMock.onPost(ENDPOINTS.AUTH.REFRESH).reply(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'rotated' },
    });

    await expect(authedClient.get(PROTECTED)).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(await TokenStorage.getRefreshToken()).toBeNull();
    expect(await TokenStorage.getAccessToken()).toBeNull();
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('rotates the pair and retries on refresh success', async () => {
    await seedTokens();

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).replyOnce(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'expired' },
    });
    unauthedMock.onPost(ENDPOINTS.AUTH.REFRESH).reply(200, {
      success: true,
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
    authedMock.onGet(PROTECTED).reply(200, {
      success: true,
      data: { ok: true },
    });

    const response = await authedClient.get(PROTECTED);
    expect(response.data).toEqual({ success: true, data: { ok: true } });
    expect(await TokenStorage.getAccessToken()).toBe('new-access');
    expect(await TokenStorage.getRefreshToken()).toBe('new-refresh');
  });

  it('shares one refresh call across concurrent 401s (single-flight)', async () => {
    await seedTokens();

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).replyOnce(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'expired' },
    });
    unauthedMock.onPost(ENDPOINTS.AUTH.REFRESH).reply(200, {
      success: true,
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
    authedMock.onGet(PROTECTED).reply(200, {
      success: true,
      data: { ok: true },
    });

    const [first, second] = await Promise.all([
      authedClient.get(PROTECTED),
      authedClient.get(PROTECTED),
    ]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(unauthedMock.history.post).toHaveLength(1);
  });

  it('does not refresh on a non-session 401 (INVALID_INPUT passes through)', async () => {
    await seedTokens();

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).reply(401, {
      success: false,
      error: { code: 'INVALID_INPUT', message: 'bad field' },
    });

    await expect(authedClient.get(PROTECTED)).rejects.toMatchObject({
      response: {
        status: 401,
        data: {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'bad field' },
        },
      },
    });

    // No refresh spent, tokens untouched.
    expect(unauthedMock.history.post).toHaveLength(0);
    expect(await TokenStorage.getRefreshToken()).toBe('valid-refresh');
    expect(await TokenStorage.getAccessToken()).toBe('expired-access');
  });

  it('refreshes on a schemaless 401 (no parseable error code)', async () => {
    await seedTokens();

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).replyOnce(401, {});
    unauthedMock.onPost(ENDPOINTS.AUTH.REFRESH).reply(200, {
      success: true,
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
    authedMock.onGet(PROTECTED).reply(200, {
      success: true,
      data: { ok: true },
    });

    const response = await authedClient.get(PROTECTED);
    expect(response.data).toEqual({ success: true, data: { ok: true } });
    expect(unauthedMock.history.post).toHaveLength(1);
    expect(await TokenStorage.getAccessToken()).toBe('new-access');
  });

  it('does not refresh on a 401 for a request sent without a bearer', async () => {
    await seedTokens();
    jest.spyOn(TokenStorage, 'getAccessToken').mockResolvedValue(null);

    const authedMock = new MockAdapter(authedClient);
    const unauthedMock = new MockAdapter(unauthedClient);
    authedMock.onGet(PROTECTED).reply(401, {
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'expired' },
    });

    await expect(authedClient.get(PROTECTED)).rejects.toMatchObject({
      response: { status: 401 },
    });

    // Bearer-less 401s can't be stale-token 401s — refresh stays untouched.
    expect(unauthedMock.history.post).toHaveLength(0);
    expect(await TokenStorage.getRefreshToken()).toBe('valid-refresh');
  });
});
