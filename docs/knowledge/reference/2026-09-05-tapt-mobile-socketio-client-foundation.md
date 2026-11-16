---
date: 2026-09-05
description: 'Implemented the realtime socket layer for tapt-mobile: a single boundary file duplicating tapt-api''s 18 socket events, a Zustand slice for…'
aliases:
  - 'tapt-mobile socket.io client foundation'
tags:
  - project-note
source_repo: tapt-api
---

> Migrated from the obsidian-mind vault (`reference/tapt-mobile/2026-09-05-tapt-mobile-socketio-client-foundation.md`) on 2026-11-16 when the `om` MCP server was retired. `[[wikilinks]]` point at vault notes and may not resolve here.

# tapt-mobile socket.io client foundation

Implemented the realtime socket layer for tapt-mobile: a single boundary file duplicating tapt-api's 18 socket events, a Zustand slice for connection state, a SocketService handling auth/retries/AppState, and hooks bridging the previously-dead useNetworkStatus hook into connect/disconnect. The existing NetInfo subscription is reused instead of adding a second one.

## What changed

- src/services/socket/socket.types.ts (new) — SOCKET_EVENTS const with all 18 wire names copied 1:1 from @tapt-api/api/events/event-names.ts, per-event payload interfaces mirroring schemas.ts, ServerToClientEvents/ClientToServerEvents maps, SocketEnvelope with shopId: string|null to match the backend gateway envelope
- src/services/socket/socket.service.ts (new) — SocketService singleton; websocket-only transport, autoConnect:false, Infinity retries with backoff+jitter, fresh async auth callback per connect/reconnect attempt; AppState background/foreground handling; connect() reconnects dangling sockets and no-ops while AppState is 'background'
- src/services/socket/index.ts (new) — barrel export
- src/store/slices/socketSlice.ts (new) — socketConnectionState + setSocketConnectionState, vanilla StateCreator<SocketSlice> exactly matching the appSlice pattern
- src/store/types.ts (edit) — StoreState intersection now includes SocketSlice
- src/store/index.ts (edit) — spread ...createSocketSlice(...a) after the other three slices; partialize untouched so connection state stays out of persistence
- src/hooks/useInitSocket.ts (new) — calls useNetworkStatus() (previously defined but never mounted anywhere) and wires tokenProvider to AsyncStorage 'token'
- src/hooks/useSocketConnection.ts (new) — watches store.networkStatus and calls socketService.connect()/disconnect(); the single consumer of the one NetInfo subscription
- src/hooks/useSocketEvent.ts (new) — typed event hook; payload flows to the handler via EnvelopeOf<TEvent>; handlerRef keeps the latest handler without re-subscribing; cleanup returns socket.off with the identical wrapped ref
- app/_layout.tsx (edit) — calls useInitSocket() then useSocketConnection() at the root
- src/hooks/index.ts (edit) — added the three new hooks to the barrel


## Decisions

- Duplicate the real 18-event contract into socket.types.ts behind one boundary file that nothing else imports around; workspace-wire @tapt-api/api/events later as a one-file swap. Rationale: hooking tapt-mobile into the Yarn workspace (module resolution, RN-incompatible deps in that package) is a real project that does not block this foundation.
- Do NOT add a second NetInfo listener in socket.service.ts. useNetworkStatus.ts already writes store.networkStatus; the socket layer bridges through the store. One subscription, two consumers — but discovered useNetworkStatus was never actually mounted, so useInitSocket calls it.
- connect() is a safe no-op when already connected/connecting, reconnects a socket left dangling by backgrounding, and defers real connection while AppState.currentState === 'background'. This closed a real stranding bug in the original design: backgrounding during a reconnect left the socket dead until the next network flap.
- Removed the wasConnectedBeforeBackground flag — handleAppStateChange resumes unconditionally on 'active' and lets connect()'s idempotence decide, instead of tracking pre-background socket state.
- useSocketEvent keeps one minimal as-never cast confined to the on/off registration call: socket.io's FallbackToUntypedListener cannot type a listener under a generic event key (TS #41778 deferred conditional). Payload typing still reaches callers via Parameters<ServerToClientEvents[K]>[0]; the cast is documented in-file.
- Set socketConnectionState AFTER the background early-return in the create path so a backgrounded no-socket connect cannot leave the store stuck reporting 'connecting'.


## Learned

- useNetworkStatus.ts and NetworkManager.ts existed but were never called from any component — store.networkStatus would never have updated without useInitSocket calling the hook. Dead wiring hides until someone consumes the field.
- socket.io-client on()/off() listener parameter is a deferred conditional type when the event key is a generic type variable; nothing concrete is assignable. Verified against component-emitter's FallbackToUntypedListener, which explicitly exists as a workaround for TypeScript #41778.
- AppState.currentState is synchronously available, so a service can branch on app state deterministically instead of tracking whether it was mid-reconnect at background time — removes a whole class of flag bugs.
- Zustand v5: individual slices use vanilla StateCreator<T> with no middleware tuple; the devtools/persist tuple is applied once at create() in store/index.ts. Matching that pattern avoids signature churn.
- React runs effects in hook-declaration order, so _layout calling useInitSocket() before useSocketConnection() makes setTokenProvider run before connect() — reliance on ordering rather than a guarantee; safe anyway because socket.io retries with a fresh auth callback each attempt.


## Verification

npx tsc --noEmit passes clean across the whole tapt-mobile workspace. ESLint full-scan timed out on Windows and was not the gate used. No live-server test (needs tapt-api running plus a JWT). The two review findings — a synchronous off() in an intermediate edit, and the background-during-reconnect stranding — were each reproduced/fixed; the fixing logic verified by tracing the state transitions.


## Open

- session:revoked only logs and disconnects — real logout (clear token, navigate to login) is blocked on auth which does not exist yet. Known consequence: with a revoked token still in AsyncStorage, the reconnect loop retries with a bad token until logout is wired.
- Merge the duplicated socket.types.ts back into re-exports from @tapt-api/api/events once tapt-mobile joins the workspace.
- No runtime verification against a live server — only tsc. Exercising the socket path needs the tapt-api gateway up plus a JWT.
- Full-project ESLint timed out on Windows; lint status of the new files is unverified.
- Three backend events (till:created, scratch:sale_created, ticket:updated) have schemas but no server-side listener currently routes them to the gateway — the client contract includes them anyway as a superset.


## Related

- brain/Patterns.md _(no note yet)_


_Recorded 2026-09-05T14:06:50.983Z from `tapt-api` via the om MCP server (routing: caller)._
