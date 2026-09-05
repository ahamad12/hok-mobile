import { useEffect } from "react";

import { NetworkStatus } from "@/constants";
import { useStore } from "@/store";

import { socketService } from "@/services/socket/socket.service";

/**
 * Bridges the existing networkStatus (kept in sync by useNetworkStatus.ts
 * via @react-native-community/netinfo) to the socket connection.
 *
 * No duplicate NetInfo listener — this hook just watches the store.
 */
export function useSocketConnection() {
  const networkStatus = useStore((s) => s.networkStatus);
  const socketState = useStore((s) => s.socketConnectionState);

  useEffect(() => {
    if (networkStatus === NetworkStatus.ONLINE) {
      if (
        socketState === "idle" ||
        socketState === "disconnected"
      ) {
        socketService.connect();
      }
    } else if (networkStatus === NetworkStatus.OFFLINE) {
      if (
        socketState === "connected" ||
        socketState === "connecting" ||
        socketState === "reconnecting"
      ) {
        socketService.disconnect();
      }
    }
  }, [networkStatus, socketState]);
}
