"use client";

import type { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

interface RoomProps {
  children: ReactNode;
  roomId: string;
}

export function Room({ children, roomId }: RoomProps) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
    >
      <RoomProvider 
        id={roomId}
        initialPresence={{
          cursor: null,
        }}
      >
        <ClientSideSuspense fallback={<div>Loading collaborative features...</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
} 