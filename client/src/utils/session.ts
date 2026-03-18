import * as Crypto from 'expo-crypto';

// Generates a random UUID to act as the anonymous session ID for this app launch.
// Not persisted — a new ID is created each time the app starts.
export function randomSessionId(): string {
  return Crypto.randomUUID();
}
