import { Server } from 'socket.io';
import { RawLocationPayload } from 'shared';
import { fuzzCoords } from './fuzz';
import { pinStore } from './store';

/**
 * Register the /location Socket.io namespace.
 *
 * Events:
 *   client → server:  'location:update'  { RawLocationPayload }  (exact GPS, fuzzed here)
 *   server → clients: 'pins:snapshot'    UserPin[]               (fuzzed, broadcast to all)
 */
export function registerLocationNamespace(io: Server): void {
  const location = io.of('/location');

  location.on('connection', (socket) => {
    console.log(`[location] connected: ${socket.id} (${pinStore.size()} pins active)`);

    // Send the current snapshot immediately so the new client sees existing pins at once
    socket.emit('pins:snapshot', pinStore.getAll());

    socket.on('location:update', (payload: RawLocationPayload) => {
      // Validate shape — ignore malformed payloads
      if (
        typeof payload?.sessionId !== 'string' ||
        typeof payload?.latitude !== 'number' ||
        typeof payload?.longitude !== 'number'
      ) {
        return;
      }

      // Fuzz before storing — we never persist exact coordinates
      const { latitude, longitude } = fuzzCoords(payload.latitude, payload.longitude);

      pinStore.upsert({
        sessionId: payload.sessionId,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      });

      // Broadcast updated snapshot to every connected client (including sender)
      location.emit('pins:snapshot', pinStore.getAll());
    });

    socket.on('disconnect', () => {
      // We don't know which sessionId belongs to this socket unless the client told us.
      // The client emits location:update before disconnecting (or we rely on timeout cleanup).
      // For the PoC, scan for pins that haven't been updated for > 60 s on disconnect.
      const cutoff = Date.now() - 60_000;
      for (const pin of pinStore.getAll()) {
        if (new Date(pin.updatedAt).getTime() < cutoff) {
          pinStore.remove(pin.sessionId);
        }
      }
      console.log(`[location] disconnected: ${socket.id} (${pinStore.size()} pins remaining)`);
      location.emit('pins:snapshot', pinStore.getAll());
    });
  });
}
