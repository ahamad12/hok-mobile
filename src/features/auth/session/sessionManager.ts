import { ENDPOINTS } from '@/constants/Endpoints';
import { queryClient } from '@/providers/queryClient';
import { unauthedClient } from '@/services/httpClient';
import { socketService } from '@/services/socket/socket.service';
import { TokenStorage } from '@/services/TokenStorage';

import { AuthGrant, UserSummary } from '../api/auth.types';
import { useAuthStore } from '../store/auth.store';

/**
 * The only place a session starts or ends. Tokens, the auth store, the
 * socket and the query cache change together here so they cannot drift.
 *
 * - `generation` changes on every start/end. Async work (profile hydration,
 *   boot restore) captures it first and drops its result if it changed, so a
 *   late response can never resurrect a session that already ended.
 * - Concurrent endSession() calls share one teardown.
 */
export type SessionEndReason =
  | 'logout' // user signed out: revoke this refresh token server-side
  | 'expired' // refresh rejected by the server
  | 'revoked' // server pushed session:revoked / signed out elsewhere
  | 'password-changed' // server already revoked every session
  | 'invalid'; // local state inconsistent at boot

const REVOKE_TIMEOUT_MS = 5_000;

let generation = 0;
let ending: Promise<void> | null = null;

export const getSessionGeneration = (): number => generation;
export const isCurrentGeneration = (g: number): boolean => g === generation;

const dropCachedData = async () => {
  // Cancel first so an in-flight fetch can't repopulate after the clear.
  await queryClient.cancelQueries();
  queryClient.clear();
};

export const startSession = async (grant: AuthGrant): Promise<void> => {
  // A teardown still running would otherwise wipe the new session.
  await ending;
  generation += 1;
  // Previous identity's data must not leak into this one.
  await dropCachedData();
  // Tokens before the store: protected screens mount (and fetch) the moment
  // status flips to signedIn.
  await TokenStorage.setTokens(grant.accessToken, grant.refreshToken);
  useAuthStore.getState().signIn(grant.user);
};

/** Replaces the user in the store if the session it was fetched for is still live. */
export const updateSessionUser = (user: UserSummary, forGeneration: number) => {
  if (
    isCurrentGeneration(forGeneration) &&
    useAuthStore.getState().status !== 'signedOut'
  ) {
    useAuthStore.getState().signIn(user);
  }
};

/** Best effort; signing out succeeds locally whether or not this does. */
const revokeServerSession = async () => {
  const refreshToken = await TokenStorage.getRefreshToken();
  if (!refreshToken) return;
  try {
    await unauthedClient.post(
      ENDPOINTS.AUTH.LOGOUT,
      { refreshToken },
      { timeout: REVOKE_TIMEOUT_MS },
    );
  } catch {
    // Offline or already revoked — local wipe below still happens.
  }
};

const teardown = async (reason: SessionEndReason) => {
  if (reason === 'logout') await revokeServerSession();
  generation += 1;
  socketService.disconnect();
  await TokenStorage.clearTokens();
  useAuthStore.getState().signOut();
  await dropCachedData();
};

/** Ends the session. Safe to call repeatedly; never rejects. */
export const endSession = (reason: SessionEndReason): Promise<void> => {
  ending ??= teardown(reason)
    .catch(() => {
      // Last resort: never leave the user stuck signed in.
      useAuthStore.getState().signOut();
    })
    .finally(() => {
      ending = null;
    });
  return ending;
};
