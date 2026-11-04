import { useEffect } from 'react';

import { NetworkStatus } from '@/constants';
import {
  selectIsSignedIn,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { socketService } from '@/services/socket/socket.service';
import { useStore } from '@/store';

/**
 * Bridges the existing networkStatus (kept in sync by useNetworkStatus.ts
 * via @react-native-community/netinfo) and the auth status to the socket
 * connection.
 *
 * No duplicate NetInfo listener — this hook just watches the store.
 * Connects only when ONLINE *and* signed in; a signed-out app never opens
 * an unauthenticated handshake loop. Sign-out disconnects immediately.
 */
export function useSocketConnection() {
  const networkStatus = useStore((s) => s.networkStatus);
  const socketState = useStore((s) => s.socketConnectionState);
  const isSignedIn = useAuthStore(selectIsSignedIn);

  useEffect(() => {
    if (!isSignedIn) {
      if (
        socketState === 'connected' ||
        socketState === 'connecting' ||
        socketState === 'reconnecting'
      ) {
        socketService.disconnect();
      }
      return;
    }

    if (networkStatus === NetworkStatus.ONLINE) {
      if (socketState === 'idle' || socketState === 'disconnected') {
        socketService.connect();
      }
    } else if (networkStatus === NetworkStatus.OFFLINE) {
      if (
        socketState === 'connected' ||
        socketState === 'connecting' ||
        socketState === 'reconnecting'
      ) {
        socketService.disconnect();
      }
    }
  }, [networkStatus, socketState, isSignedIn]);
}
