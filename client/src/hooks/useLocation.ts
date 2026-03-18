import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Socket } from 'socket.io-client';
import { RawLocationPayload, Track } from 'shared';
import { getSessionId } from './useSessionId';

const LOCATION_INTERVAL_MS = 15_000; // emit every 15 seconds

interface Options {
  /** Socket from useSocket — pass null if not connected yet */
  socket: Socket | null;
  /** Currently playing track — attached to the payload so the server can store it on the pin */
  track: Track | null;
}

/**
 * Requests foreground location permission and emits 'location:update' to the
 * server every 15 seconds. The server fuzzes coords before broadcasting.
 *
 * Also re-emits immediately when the track changes so the pin updates without
 * waiting up to 15 s for the next GPS tick.
 */
export function useLocation({ socket, track }: Options): void {
  // Refs keep the watcher callback up-to-date without restarting it on every change
  const socketRef = useRef(socket);
  const trackRef = useRef(track);
  // Stores the most recent GPS coords so we can re-emit on track change
  const lastPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
  useEffect(() => { socketRef.current = socket; }, [socket]);
  useEffect(() => { trackRef.current = track; }, [track]);

  // Emit immediately whenever the track changes (don't wait for the 15 s GPS tick)
  useEffect(() => {
    if (!lastPositionRef.current || !socketRef.current) return;
    const { latitude, longitude } = lastPositionRef.current;
    getSessionId().then((sessionId) => {
      socketRef.current?.emit('location:update', {
        sessionId,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
        track: track ?? undefined,
      } satisfies RawLocationPayload);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

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

          // Keep latest coords so the track-change effect can re-emit immediately
          lastPositionRef.current = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          const sessionId = await getSessionId();
          const payload: RawLocationPayload = {
            sessionId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            updatedAt: new Date().toISOString(),
            // Include current track if one is playing — server stores it on the pin
            track: trackRef.current ?? undefined,
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
