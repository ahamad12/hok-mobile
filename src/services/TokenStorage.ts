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
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken, SECURE_OPTS),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken, SECURE_OPTS),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },

  /**
   * One-time backfill from the legacy AsyncStorage 'token' key into
   * SecureStore. Legacy storage held an access token only — the refresh
   * token backfills naturally on the next 401-triggered rotation.
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
