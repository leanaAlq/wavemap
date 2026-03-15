import { UserPin } from 'shared';

// In-memory store for active user pins.
// Lives only in process memory — never written to disk or DB (privacy requirement).
const pins = new Map<string, UserPin>();

export const pinStore = {
  upsert(pin: UserPin): void {
    pins.set(pin.sessionId, pin);
  },

  remove(sessionId: string): void {
    pins.delete(sessionId);
  },

  getAll(): UserPin[] {
    return Array.from(pins.values());
  },

  addReaction(sessionId: string, emoji: import('shared').ReactionPayload['emoji']): void {
    const pin = pins.get(sessionId);
    if (!pin) return;
    const reactions = { ...pin.reactions };
    reactions[emoji] = (reactions[emoji] ?? 0) + 1;
    pins.set(sessionId, { ...pin, reactions });
  },

  size(): number {
    return pins.size;
  },
};
