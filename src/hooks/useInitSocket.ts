import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { registerTokenRefreshHandler } from '@/services/httpClient';
import { socketService } from '@/services/socket/socket.service';
import { TokenStorage } from '@/services/TokenStorage';

/**
 * Single call at app root. Wires:
 *  - NetInfo → store.networkStatus (via useNetworkStatus)
 *  - Token provider for socket auth
 *
 * useSocketConnection (separate hook) watches store.networkStatus and
 * triggers connect/disconnect. The two hooks are intentionally split so
 * each has a single responsibility.
 */
export function useInitSocket() {
  useNetworkStatus();

  useEffect(() => {
    socketService.setTokenProvider(() => TokenStorage.getAccessToken());
    socketService.setSignedInProvider(
      () => useAuthStore.getState().status === 'signedIn',
    );
    registerTokenRefreshHandler(() => {
      socketService.reconnect();
    });

    return () => {
      registerTokenRefreshHandler(null);
      socketService.setSignedInProvider(null);
      socketService.disconnect();
    };
  }, []);
}
