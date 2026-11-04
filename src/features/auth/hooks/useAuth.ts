import {
  selectAuthStatus,
  selectIsSignedIn,
  selectUser,
  useAuthStore,
} from '../store/auth.store';

/** Convenience selectors so screens never touch the store shape directly. */
export const useUser = () => useAuthStore(selectUser);
export const useAuthStatus = () => useAuthStore(selectAuthStatus);
export const useIsSignedIn = () => useAuthStore(selectIsSignedIn);
