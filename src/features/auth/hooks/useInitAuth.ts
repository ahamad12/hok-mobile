import { useEffect } from 'react';

import {
  isFatalRefreshError,
  registerAuthFailureHandler,
} from '@/services/httpClient';
import { socketService } from '@/services/socket/socket.service';
import { TokenStorage } from '@/services/TokenStorage';

import { getProfile } from '../api/auth.api';
import {
  endSession,
  getSessionGeneration,
  updateSessionUser,
} from '../session/sessionManager';
import { useAuthStore } from '../store/auth.store';

/**
 * Called once at the app root. Wires server-driven sign-outs into the
 * session manager and restores a stored session on boot.
 */
export function useInitAuth() {
  useEffect(() => {
    // Refresh token rejected by the server (expired, reused, revoked).
    registerAuthFailureHandler(() => void endSession('expired'));
    // Server push: password changed / signed out from another device.
    socketService.registerSessionRevokedHandler(
      () => void endSession('revoked'),
    );

    (async () => {
      const g = getSessionGeneration();
      useAuthStore.getState().setRestoring();
      try {
        await TokenStorage.migrateLegacyToken();
        if (!(await TokenStorage.getRefreshToken())) {
          useAuthStore.getState().signOut();
          return;
        }
        // An expired access token is rotated by the httpClient 401 logic.
        updateSessionUser(await getProfile(), g);
      } catch (error) {
        // Fatal = dead session: wipe. Transient (offline, 5xx) = keep the
        // tokens so the next launch retries the same session.
        if (isFatalRefreshError(error)) await endSession('invalid');
        else useAuthStore.getState().signOut();
      }
    })();

    return () => {
      registerAuthFailureHandler(null);
    };
  }, []);
}
