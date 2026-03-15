// Backend URL. For a physical device, set EXPO_PUBLIC_SERVER_URL to your Mac's
// LAN IP (e.g. http://192.168.1.x:3000) in client/.env.local — simulator can
// use localhost.
export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:3000';
