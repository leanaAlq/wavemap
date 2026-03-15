import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserPin } from 'shared';
import { SERVER_URL } from '../config/server';

export interface SocketState {
  pins: UserPin[];
  connected: boolean;
  /** Stable socket ref — use to emit events from other hooks */
  socket: Socket | null;
}

export function useSocket(): SocketState {
  const [pins, setPins] = useState<UserPin[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the /location namespace only
    const socket = io(`${SERVER_URL}/location`, {
      transports: ['websocket'], // skip HTTP long-polling — simpler for React Native
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useSocket] connected', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[useSocket] disconnected');
      setConnected(false);
    });

    socket.on('pins:snapshot', (incoming: UserPin[]) => {
      setPins(incoming);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // connect once on mount

  return { pins, connected, socket: socketRef.current };
}
