import { Server } from 'socket.io';
import type { UserPin } from 'shared';

// In-memory store: sessionId → pin. Never written to the DB.
const activePins = new Map<string, UserPin>();

// Drop users who haven't sent an update in 2 minutes
const STALE_MS = 2 * 60 * 1000;

function evictStalePins() {
  const cutoff = Date.now() - STALE_MS;
  for (const [id, pin] of activePins) {
    if (new Date(pin.updatedAt).getTime() < cutoff) activePins.delete(id);
  }
}

// Fuzz coordinates by a random ±50 m offset before storing/broadcasting.
// Never use exact GPS coordinates — privacy requirement.
function fuzz(lat: number, lon: number) {
  const maxMetres = 50;
  const latDelta = ((Math.random() * 2 - 1) * maxMetres) / 111_000;
  const lonDelta =
    ((Math.random() * 2 - 1) * maxMetres) /
    (111_000 * Math.cos((lat * Math.PI) / 180));
  return { latitude: lat + latDelta, longitude: lon + lonDelta };
}

export function registerLocationNamespace(io: Server) {
  const ns = io.of('/location');

  ns.on('connection', (socket) => {
    console.log('User connected to /location:', socket.id);

    socket.on(
      'location:update',
      (payload: {
        sessionId: string;
        latitude: number;
        longitude: number;
        updatedAt: string;
        track?: UserPin['track'];
      }) => {
        evictStalePins();

        const { latitude, longitude } = fuzz(payload.latitude, payload.longitude);

        const pin: UserPin = {
          sessionId: payload.sessionId,
          latitude,
          longitude,
          updatedAt: new Date().toISOString(),
          track: payload.track,
        };

        activePins.set(payload.sessionId, pin);

        // Broadcast all current pins to every connected client
        ns.emit('pins:update', Array.from(activePins.values()));
      },
    );

    socket.on('disconnect', () => {
      console.log('User disconnected from /location:', socket.id);
      // We don't remove immediately — let stale eviction handle it so brief
      // disconnects don't cause flickering on the map.
    });
  });
}
