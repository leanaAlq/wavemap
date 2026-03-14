// Spotify OAuth configuration.
// EXPO_PUBLIC_ prefix makes this variable available in the Expo JS bundle.
// Set it in client/.env.local (never commit that file).
export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

// Scopes needed for the PoC. Expand in Phase 1 as features grow.
export const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
];

// Spotify's well-known OAuth 2.0 endpoints
export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};
