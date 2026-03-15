import * as Crypto from 'expo-crypto';

// Module-level variable: generated once on first import, lives until the app
// process is killed. Never written to SecureStore — satisfies the privacy rule
// that session IDs must not persist across launches.
let sessionId: string | null = null;

export async function getSessionId(): Promise<string> {
  if (!sessionId) {
    // randomUUID() is available in expo-crypto ≥ 12 (Expo SDK 47+)
    sessionId = Crypto.randomUUID();
  }
  return sessionId;
}
