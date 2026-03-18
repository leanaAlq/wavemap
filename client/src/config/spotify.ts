// Spotify app credentials — get these from developer.spotify.com
// Add EXPO_PUBLIC_SPOTIFY_CLIENT_ID to client/.env.local
export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

export const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
];

export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};
