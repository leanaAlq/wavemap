import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Socket } from 'socket.io-client';
import { RawLocationPayload } from 'shared';
import { getSessionId } from './useSessionId';

const LOCATION_INTERVAL_MS = 15_000; // emit every 15 seconds

interface Options {
  /** Socket from useSocket — pass null if not connected yet */
  socket: Socket | null;
}

/**
 * Requests foreground location permission and emits 'location:update' to the
 * server every 15 seconds. The server fuzzes coords before broadcasting.
 */
export function useLocation({ socket }: Options): void {
  // Keep a stable ref to the latest socket so the watcher callback always
  // has the current socket without needing to restart the watcher.
  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;
    let lastEmitTime = 0;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[useLocation] location permission denied');
        return;
      }

      if (cancelled) return;

      // watchPositionAsync fires on every meaningful position change; we throttle
      // to at most once per LOCATION_INTERVAL_MS to respect the 15 s target.
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: LOCATION_INTERVAL_MS,
          distanceInterval: 0,
        },
        async (loc) => {
          const now = Date.now();
          if (now - lastEmitTime < LOCATION_INTERVAL_MS - 1000) return; // guard against rapid fires
          lastEmitTime = now;

          const sessionId = await getSessionId();
          const payload: RawLocationPayload = {
            sessionId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            updatedAt: new Date().toISOString(),
          };

          socketRef.current?.emit('location:update', payload);
        },
      );
    }

    start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []); // start once on mount; socketRef keeps the emit up-to-date
}
