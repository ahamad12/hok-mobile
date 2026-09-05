import { useEffect, useRef } from "react";

import { useStore } from "@/store";

import { socketService } from "@/services/socket/socket.service";
import type {
  ServerToClientEvents,
  SocketEnvelope,
} from "@/services/socket/socket.types";

type EnvelopeOf<TEvent extends keyof ServerToClientEvents> = Parameters<
  ServerToClientEvents[TEvent]
>[0];

export function useSocketEvent<TEvent extends keyof ServerToClientEvents>(
  event: TEvent,
  handler: (envelope: EnvelopeOf<TEvent>) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const connectionState = useStore((s) => s.socketConnectionState);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // socket.io's on() types the listener via FallbackToUntypedListener, which
    // degrades to a deferred conditional when Ev is a generic type variable —
    // nothing concrete is assignable then (TypeScript #41778). Payload types
    // still reach callers through EnvelopeOf<TEvent>; the cast is confined to
    // this one registration boundary.
    const wrapped = (envelope: SocketEnvelope) =>
      handlerRef.current(envelope as EnvelopeOf<TEvent>);
    socket.on(event as never, wrapped as never);

    return () => {
      socket.off(event as never, wrapped as never);
    };
  }, [event, connectionState]);
}