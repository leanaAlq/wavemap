// Shared types used by both /client and /server.
// Kept as stubs — fleshed out in later PoC steps.

/** A track currently playing on Spotify */
export interface Track {
  id: string;
  name: string;
  artist: string;
  albumArt: string; // URL to album art image
  previewUrl?: string;
}

/**
 * A user's fuzzed position on the map.
 * IMPORTANT: coordinates are always ±50 m fuzzed — never exact.
 */
export interface LocationPayload {
  sessionId: string; // anonymous session token, not a real user ID
  latitude: number;  // fuzzed
  longitude: number; // fuzzed
  updatedAt: string; // ISO 8601
}

/** A user pin on the map — location + optional now-playing track */
export interface UserPin extends LocationPayload {
  track?: Track;
}

/** Reaction event sent when a user taps an emoji on a pin */
export interface ReactionPayload {
  pinSessionId: string; // which pin is being reacted to
  emoji: '👍' | '🔥' | '❤️' | '🎵';
}
