import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

import { SOCKET_URL } from '@/config/Environment';
import { useStore } from '@/store';

import {
  ClientToServerEvents,
  ConnectionState,
  ServerToClientEvents,
  SOCKET_EVENTS,
} from './socket.types';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type TokenProvider = () => Promise<string | null>;
type SignedInProvider = () => boolean;
type SessionRevokedHandler = () => void;

const RECONNECTION_DELAY_MS = 1000;
const RECONNECTION_DELAY_MAX_MS = 25000;

class SocketService {
  private socket: AppSocket | null = null;
  private tokenProvider: TokenProvider | null = null;
  private signedInProvider: SignedInProvider | null = null;
  private sessionRevokedHandler: SessionRevokedHandler | null = null;
  private appStateSub: NativeEventSubscription | null = null;

  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  /**
   * Registers the signed-in check used to gate connect(). A signed-out app
   * must never open an unauthenticated handshake loop. Read fresh on every
   * connect() call (including AppState-resume) — never cached.
   */
  setSignedInProvider(provider: SignedInProvider | null) {
    this.signedInProvider = provider;
  }

  /**
   * Registers the handler invoked when the server pushes session:revoked
   * (password change → tokenVersion bump, guide §9). The service still
   * disconnects first; the handler owns token wipe + store sign-out so the
   * socket layer never touches auth state directly.
   */
  registerSessionRevokedHandler(handler: SessionRevokedHandler | null) {
    this.sessionRevokedHandler = handler;
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
    // Never handshake while signed out — without a token the server rejects
    // and the infinite-reconnect config would spin an unauthenticated loop.
    if (this.signedInProvider && !this.signedInProvider()) return;

    if (this.socket) {
      if (this.socket.connected || this.socket.active) return;
      if (AppState.currentState === 'background') return;
      this.setConnectionState('connecting');
      this.socket.connect();
      return;
    }

    if (!this.tokenProvider) {
      console.warn(
        '[SocketService] connect() called before setTokenProvider()',
      );
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
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

    if (AppState.currentState === 'background') return;
    this.setConnectionState('connecting');
    this.socket.connect();
  }

  disconnect() {
    this.teardownAppStateListener();
    this.socket?.disconnect();
    this.socket = null;
    this.setConnectionState('disconnected');
  }

  /**
   * Re-handshakes an existing socket so it picks up a freshly rotated
   * access token (401-refresh path). No-op when no socket exists yet —
   * the next connect() will read the fresh token via the provider anyway.
   * Unlike disconnect(), this keeps the socket instance + AppState listener.
   */
  reconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    if (AppState.currentState === 'background') return;
    this.setConnectionState('connecting');
    this.socket.connect();
  }

  private registerCoreListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.setConnectionState('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.setConnectionState('disconnected');
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (err) => {
      this.setConnectionState('reconnecting');
      console.warn('[SocketService] connect_error:', err.message);
    });

    this.socket.io.on('reconnect_attempt', () => {
      this.setConnectionState('reconnecting');
    });

    this.socket.on(SOCKET_EVENTS.SESSION_REVOKED, () => {
      console.warn('[SocketService] session revoked by server');
      this.disconnect();
      this.sessionRevokedHandler?.();
    });
  }

  private registerAppStateListener() {
    this.appStateSub = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
  }

  private teardownAppStateListener() {
    this.appStateSub?.remove();
    this.appStateSub = null;
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'background') {
      this.socket?.disconnect();
      this.setConnectionState('disconnected');
    } else if (state === 'active') {
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
