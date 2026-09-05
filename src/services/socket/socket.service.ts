import { AppState, AppStateStatus, NativeEventSubscription } from "react-native";
import { io, Socket } from "socket.io-client";

import Environment from "@/config/Environment";
import { useStore } from "@/store";

import type {
  ClientToServerEvents,
  ConnectionState,
  ServerToClientEvents,
} from "./socket.types";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type TokenProvider = () => Promise<string | null>;

const RECONNECTION_DELAY_MS = 1000;
const RECONNECTION_DELAY_MAX_MS = 25000;

class SocketService {
  private socket: AppSocket | null = null;
  private tokenProvider: TokenProvider | null = null;
  private appStateSub: NativeEventSubscription | null = null;

  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  getSocket(): AppSocket | null {
    return this.socket;
  }

  /**
   * Makes the socket exist and connects it. Safe to call from multiple
   * sources (useSocketConnection's network bridge, AppState resume, feature
   * hooks): it no-ops when already connected/connecting, reconnects a socket
   * left dangling by backgrounding, and defers to foreground resume when the
   * app is explicitly backgrounded.
   */
  connect() {
    if (this.socket) {
      if (this.socket.connected || this.socket.active) return;
      if (AppState.currentState === "background") return;
      this.setConnectionState("connecting");
      this.socket.connect();
      return;
    }

    if (!this.tokenProvider) {
      console.warn("[SocketService] connect() called before setTokenProvider()");
    }

    this.socket = io(Environment.apiUrl, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: RECONNECTION_DELAY_MS,
      reconnectionDelayMax: RECONNECTION_DELAY_MAX_MS,
      randomizationFactor: 0.5,
      auth: async (cb) => {
        const token = this.tokenProvider ? await this.tokenProvider() : null;
        cb({ token: token ? `Bearer ${token}` : undefined });
      },
    });

    this.registerCoreListeners();
    this.registerAppStateListener();

    if (AppState.currentState === "background") return;
    this.setConnectionState("connecting");
    this.socket.connect();
  }

  disconnect() {
    this.teardownAppStateListener();
    this.socket?.disconnect();
    this.socket = null;
    this.setConnectionState("disconnected");
  }

  private registerCoreListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.setConnectionState("connected");
    });

    this.socket.on("disconnect", (reason) => {
      this.setConnectionState("disconnected");
      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (err) => {
      this.setConnectionState("reconnecting");
      console.warn("[SocketService] connect_error:", err.message);
    });

    this.socket.io.on("reconnect_attempt", () => {
      this.setConnectionState("reconnecting");
    });

    this.socket.on("session:revoked", () => {
      console.warn("[SocketService] session revoked by server");
      this.disconnect();
    });
  }

  private registerAppStateListener() {
    this.appStateSub = AppState.addEventListener(
      "change",
      this.handleAppStateChange,
    );
  }

  private teardownAppStateListener() {
    this.appStateSub?.remove();
    this.appStateSub = null;
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    if (state === "background") {
      this.socket?.disconnect();
      this.setConnectionState("disconnected");
    } else if (state === "active") {
      // Resume no matter how the socket was when backgrounding — connected,
      // mid-reconnect, or never established. connect() is a safe no-op when
      // there is nothing to resume.
      this.connect();
    }
  };

  private setConnectionState(state: ConnectionState) {
    useStore.getState().setSocketConnectionState(state);
  }
}

export const socketService = new SocketService();