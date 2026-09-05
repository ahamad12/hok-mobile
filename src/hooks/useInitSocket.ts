import { useEffect } from "react";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { socketService } from "@/services/socket/socket.service";
import { TokenStorage } from "@/services/TokenStorage";

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

    return () => {
      socketService.disconnect();
    };
  }, []);
}
