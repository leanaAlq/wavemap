import { Server } from 'socket.io';
import { RawLocationPayload, ReactionPayload } from 'shared';
import { fuzzCoords } from './fuzz';
import { pinStore } from './store';
import { insertComment, getCommentsByPin, insertReaction, getReactionCountsByPin } from '../comments/queries';

/**
 * Events:
 *   client → server:  location:update   RawLocationPayload
 *   server → clients: pins:snapshot     UserPin[]
 *   client → server:  reaction          ReactionPayload
 *   server → clients: reaction:received ReactionPayload  (legacy — snapshot now carries counts)
 *   client → server:  comment:post      { pinSessionId, text }
 *   client → server:  comments:load     { pinSessionId }
 *   server → client:  comments:list     { pinSessionId, comments: Comment[] }
 *   server → nearby:  comment:new       Comment          (clients within 500 m of the pin)
 */
export function registerLocationNamespace(io: Server): void {
  const location = io.of('/location');

  // Track which sessionId each socket belongs to (set when they send location:update).
  // Used to filter comment broadcasts to nearby users.
  const socketToSession = new Map<string, string>();

  /** Haversine distance in metres between two lat/lng points. */
  function distanceMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6_371_000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  location.on('connection', (socket) => {
    console.log(`[location] connected: ${socket.id} (${pinStore.size()} pins active)`);
    socket.emit('pins:snapshot', pinStore.getAll());

    // ── Location ────────────────────────────────────────────────────────────
    socket.on('location:update', (payload: RawLocationPayload) => {
      if (
        typeof payload?.sessionId !== 'string' ||
        typeof payload?.latitude !== 'number' ||
        typeof payload?.longitude !== 'number'
      ) return;

      socketToSession.set(socket.id, payload.sessionId);

      const { latitude, longitude } = fuzzCoords(payload.latitude, payload.longitude);
      pinStore.upsert({ sessionId: payload.sessionId, latitude, longitude, updatedAt: new Date().toISOString(), track: payload.track });
      location.emit('pins:snapshot', pinStore.getAll());
    });

    // ── Reactions ────────────────────────────────────────────────────────────
    socket.on('reaction', async (payload: ReactionPayload) => {
      if (typeof payload?.pinSessionId !== 'string' || typeof payload?.emoji !== 'string') return;
      pinStore.addReaction(payload.pinSessionId, payload.emoji);
      location.emit('pins:snapshot', pinStore.getAll());
      // Persist to DB so reactions survive server restarts
      try { await insertReaction(payload.pinSessionId, payload.emoji); } catch { /* non-fatal */ }
    });

    // ── Comments ─────────────────────────────────────────────────────────────
    socket.on('comments:load', async ({ pinSessionId }: { pinSessionId: string }) => {
      if (typeof pinSessionId !== 'string') return;
      try {
        const [comments, dbReactions] = await Promise.all([
          getCommentsByPin(pinSessionId),
          getReactionCountsByPin(pinSessionId),
        ]);
        // Merge DB reaction counts into the in-memory pin so the snapshot is consistent
        for (const [emoji, count] of Object.entries(dbReactions)) {
          const pin = pinStore.getAll().find(p => p.sessionId === pinSessionId);
          if (pin) {
            pin.reactions = { ...pin.reactions, [emoji]: count as number };
          }
        }
        socket.emit('comments:list', { pinSessionId, comments });
      } catch (err) {
        console.error('[comments] load error', err);
      }
    });

    socket.on('comment:post', async ({ pinSessionId, text }: { pinSessionId: string; text: string }) => {
      if (typeof pinSessionId !== 'string' || typeof text !== 'string') return;
      const trimmed = text.trim().slice(0, 280);
      if (!trimmed) return;

      // Use the session mapped from location:update — client doesn't supply their own ID
      const authorSessionId = socketToSession.get(socket.id);
      if (!authorSessionId) return; // must have sent location first

      try {
        const comment = await insertComment(pinSessionId, authorSessionId, trimmed);

        // Broadcast only to sockets within 500 m of the pin
        const pin = pinStore.getAll().find(p => p.sessionId === pinSessionId);
        for (const [sid, sessionId] of socketToSession) {
          const viewer = pinStore.getAll().find(p => p.sessionId === sessionId);
          // If we don't know the viewer's position yet, send it anyway
          const withinRange = !pin || !viewer ||
            distanceMetres(viewer.latitude, viewer.longitude, pin.latitude, pin.longitude) <= 500;
          if (withinRange) {
            location.to(sid).emit('comment:new', comment);
          }
        }
      } catch (err) {
        console.error('[comments] post error', err);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      socketToSession.delete(socket.id);
      const cutoff = Date.now() - 60_000;
      for (const pin of pinStore.getAll()) {
        if (new Date(pin.updatedAt).getTime() < cutoff) pinStore.remove(pin.sessionId);
      }
      console.log(`[location] disconnected: ${socket.id} (${pinStore.size()} pins remaining)`);
      location.emit('pins:snapshot', pinStore.getAll());
    });
  });
}
