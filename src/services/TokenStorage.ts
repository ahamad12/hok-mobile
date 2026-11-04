import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'tapt.accessToken';
const REFRESH_TOKEN_KEY = 'tapt.refreshToken';
const LEGACY_TOKEN_KEY = 'token';

const SECURE_OPTS = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
} as const;

/**
 * Thin async wrapper over SecureStore. Tokens never touch AsyncStorage or
 * zustand/persist — this is the single source of truth for both.
 */
export const TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    // Sequential writes: a half-written pair (access without refresh) is
    // worse than a failure — on partial failure delete both so the next
    // boot sees a clean signed-out state instead of mismatched tokens.
    try {
      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        accessToken,
        SECURE_OPTS,
      );
      await SecureStore.setItemAsync(
        REFRESH_TOKEN_KEY,
        refreshToken,
        SECURE_OPTS,
      );
    } catch (error) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },

  /**
   * One-time backfill from the legacy AsyncStorage 'token' key into
   * SecureStore. Legacy storage held an access token only — with no refresh
   * token the next authed request fails refresh and force-signs-out, so a
   * legacy-only device lands on login rather than silently rotating.
   * Call once at app startup (before the first authed request).
   */
  async migrateLegacyToken(): Promise<void> {
    const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, legacy, SECURE_OPTS);
      await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  },
};
