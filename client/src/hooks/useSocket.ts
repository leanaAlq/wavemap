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
  // State (not ref) so callers re-render when the socket becomes available
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(`${SERVER_URL}/location`, {
      transports: ['websocket'],
      reconnectionDelay: 2000,
    });

    // Store in state so useLocation/MapScreen receive the real socket on next render
    setSocket(s);

    s.on('connect', () => {
      console.log('[useSocket] connected', s.id);
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[useSocket] disconnected');
      setConnected(false);
    });

    s.on('pins:snapshot', (incoming: UserPin[]) => {
      setPins(incoming);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  return { pins, connected, socket };
}
