import { create } from 'zustand';

import { AuthStatus, UserSummary } from '../api/auth.types';

/**
 * Session state only: current user + signed-in status.
 * Deliberately a standalone store with NO persist middleware — nothing here
 * (and especially never tokens) may end up in AsyncStorage. Tokens live
 * exclusively in TokenStorage (SecureStore).
 */
type AuthStore = {
  user: UserSummary | null;
  status: AuthStatus;
  signIn: (user: UserSummary) => void;
  signOut: () => void;
  setRestoring: () => void;
};

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  // Cold boot must never flash the signed-out route before restore runs —
  // guards treat 'restoring' as loading, not as signed-out.
  status: 'restoring',

  signIn: (user) => set({ user, status: 'signedIn' }),
  signOut: () => set({ user: null, status: 'signedOut' }),
  setRestoring: () => set({ status: 'restoring' }),
}));

export const selectUser = (s: AuthStore) => s.user;
export const selectAuthStatus = (s: AuthStore) => s.status;
export const selectIsSignedIn = (s: AuthStore) => s.status === 'signedIn';
