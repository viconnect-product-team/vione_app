// BC-Mobile WebSocket Real-time Client (Socket.IO)
// Manages real-time connection for Moments, Comments, DM, NFC Touch, and Notifications.

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { NEST_API_URL } from "@/lib/api-client";
import { useViewerUserId } from "./use-viewer-user-id";

let globalSocket: Socket | null = null;

export function getConnectAppSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(NEST_API_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return globalSocket;
}

export function useConnectAppSocket(room?: string) {
  const socketRef = useRef<Socket | null>(null);
  const viewerUserId = useViewerUserId();

  useEffect(() => {
    const socket = getConnectAppSocket();
    socketRef.current = socket;

    // Join personal user room for targeted notifications, NFC tap alerts, DMs
    if (viewerUserId) {
      socket.emit("join:room", `user:${viewerUserId}`);
    }

    // Join specific room if provided (e.g. `moment:${momentId}`, `thread:${threadId}`)
    if (room) {
      socket.emit("join:room", room);
    }

    return () => {
      if (room) {
        socket.emit("leave:room", room);
      }
    };
  }, [room, viewerUserId]);

  return socketRef.current || getConnectAppSocket();
}
