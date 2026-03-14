import { useEffect, useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { SPOTIFY_CLIENT_ID, SPOTIFY_SCOPES, SPOTIFY_DISCOVERY } from '../config/spotify';

// Tells Expo to close the auth browser and hand the redirect back to the app
WebBrowser.maybeCompleteAuthSession();

const KEYS = {
  access: 'spotify_access_token',
  refresh: 'spotify_refresh_token',
  expiry: 'spotify_token_expiry',
} as const;

// --- Token persistence helpers (no component state; safe to call anywhere) ---

async function saveTokens(access: string, refresh: string | null, expiresIn: number) {
  const expiry = String(Date.now() + expiresIn * 1000);
  await SecureStore.setItemAsync(KEYS.access, access);
  if (refresh) await SecureStore.setItemAsync(KEYS.refresh, refresh);
  await SecureStore.setItemAsync(KEYS.expiry, expiry);
}

async function deleteTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.access),
    SecureStore.deleteItemAsync(KEYS.refresh),
    SecureStore.deleteItemAsync(KEYS.expiry),
  ]);
}

// --- Hook ---

export interface SpotifyAuthState {
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  /** Call when a 401 is received; returns a fresh token or null if re-login is needed */
  refreshAccessToken: () => Promise<string | null>;
}

export function useSpotifyAuth(): SpotifyAuthState {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on mount while we check SecureStore
  const [error, setError] = useState<string | null>(null);

  // makeRedirectUri() returns:
  //   Expo Go dev:  exp://<host>:8081
  //   Standalone:   wavemap://
  // Both must be added to the Spotify dashboard's allowed redirect URIs.
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'wavemap' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      usePKCE: true, // expo-auth-session handles verifier/challenge generation
      redirectUri,
    },
    SPOTIFY_DISCOVERY,
  );

  // On mount, restore a previously saved token if it hasn't expired yet
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(KEYS.access);
        const expiry = await SecureStore.getItemAsync(KEYS.expiry);
        if (stored && expiry && Date.now() < Number(expiry)) {
          setAccessToken(stored);
        } else if (stored) {
          // Token exists but is expired — silently refresh before showing the UI
          await doRefresh();
        }
      } catch {
        // SecureStore unavailable (e.g. simulator without keychain) — just stay logged out
      } finally {
        setIsLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle the redirect back from Spotify's authorization page
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success' && request?.codeVerifier) {
      exchangeCode(response.params.code, request.codeVerifier);
    } else if (response.type === 'error') {
      setError(response.error?.message ?? 'Authorization failed');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  async function exchangeCode(code: string, codeVerifier: string) {
    setIsLoading(true);
    try {
      const result = await AuthSession.exchangeCodeAsync(
        {
          clientId: SPOTIFY_CLIENT_ID,
          code,
          redirectUri,
          // PKCE: send the original verifier so Spotify can verify the challenge
          extraParams: { code_verifier: codeVerifier },
        },
        SPOTIFY_DISCOVERY,
      );
      await saveTokens(result.accessToken, result.refreshToken ?? null, result.expiresIn ?? 3600);
      setAccessToken(result.accessToken);
      setError(null);
    } catch {
      setError('Could not complete login — please try again');
    } finally {
      setIsLoading(false);
    }
  }

  // Separated so it can be called both inside the hook (mount) and outside (401 handler)
  async function doRefresh(): Promise<string | null> {
    const refreshToken = await SecureStore.getItemAsync(KEYS.refresh);
    if (!refreshToken) return null;
    try {
      const result = await AuthSession.refreshAsync(
        { clientId: SPOTIFY_CLIENT_ID, refreshToken },
        SPOTIFY_DISCOVERY,
      );
      // Spotify may or may not return a new refresh token; keep the old one if not
      const nextRefresh = result.refreshToken ?? refreshToken;
      await saveTokens(result.accessToken, nextRefresh, result.expiresIn ?? 3600);
      setAccessToken(result.accessToken);
      return result.accessToken;
    } catch {
      // Refresh token invalid (user revoked access) — force re-login
      await deleteTokens();
      setAccessToken(null);
      return null;
    }
  }

  const refreshAccessToken = useCallback(doRefresh, []);

  const login = useCallback(() => {
    if (!SPOTIFY_CLIENT_ID) {
      setError('EXPO_PUBLIC_SPOTIFY_CLIENT_ID is not set — see client/.env.local.example');
      return;
    }
    setError(null);
    promptAsync();
  }, [promptAsync]);

  const logout = useCallback(async () => {
    await deleteTokens();
    setAccessToken(null);
  }, []);

  return { accessToken, isLoading, error, login, logout, refreshAccessToken };
}
