import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { UserPin } from 'shared';
import { randomSessionId } from '../utils/session';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
const EMIT_INTERVAL_MS = 15_000;

const SESSION_ID = randomSessionId();

export function useLocationSocket(track?: UserPin['track']) {
  const [pins, setPins] = useState<UserPin[]>([]);
  const [locationGranted, setLocationGranted] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  // Keep track in a ref so location emissions always use the latest value
  // without causing the socket to reconnect on every track change.
  const trackRef = useRef(track);
  useEffect(() => { trackRef.current = track; }, [track]);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      setLocationGranted(status === 'granted');
    });
  }, []);

  useEffect(() => {
    if (!locationGranted) return;

    const socket = io(`${SERVER_URL}/location`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('pins:update', (incoming: UserPin[]) => setPins(incoming));

    async function emitLocation() {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      socket.emit('location:update', {
        sessionId: SESSION_ID,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        updatedAt: new Date().toISOString(),
        track: trackRef.current,
      });
    }

    emitLocation();
    const timer = setInterval(emitLocation, EMIT_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      socket.disconnect();
    };
  }, [locationGranted]); // socket created once; track updates via ref

  function sendReaction(pinSessionId: string, emoji: string) {
    socketRef.current?.emit('reaction:send', { pinSessionId, emoji });
  }

  return { pins, locationGranted, sessionId: SESSION_ID, sendReaction };
}
