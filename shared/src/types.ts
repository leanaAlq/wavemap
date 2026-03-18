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
  /** Cumulative reaction counts — key is the emoji string */
  reactions?: Partial<Record<ReactionPayload['emoji'], number>>;
}

/**
 * Raw GPS payload sent by the client to the server.
 * Contains EXACT coordinates — never forwarded to other clients.
 * The server fuzzes to ±50 m before storing or broadcasting.
 */
export interface RawLocationPayload {
  sessionId: string;
  latitude: number;  // exact — fuzzed server-side only
  longitude: number; // exact
  updatedAt: string; // ISO 8601
  track?: Track;     // currently playing track — attached in Step 4, passed through as-is
}

/** Reaction event sent when a user taps an emoji on a pin */
export interface ReactionPayload {
  pinSessionId: string; // which pin is being reacted to
  emoji: '👍' | '🔥' | '❤️' | '🎵';
}

/**
 * A public comment on a map pin.
 * author_session_id is stored server-side only — never sent to clients.
 */
export interface Comment {
  id: string;
  pinSessionId: string;
  text: string;
  createdAt: string; // ISO 8601
}
