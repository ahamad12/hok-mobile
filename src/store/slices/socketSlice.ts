import { StateCreator } from "zustand";

import type { ConnectionState } from "@/services/socket/socket.types";

export type SocketSlice = {
  socketConnectionState: ConnectionState;
  setSocketConnectionState: (state: ConnectionState) => void;
};

type SocketStateCreator = StateCreator<SocketSlice>;

export const createSocketSlice: SocketStateCreator = (set) => ({
  socketConnectionState: "idle",
  setSocketConnectionState: (socketConnectionState) =>
    set({ socketConnectionState }),
});
