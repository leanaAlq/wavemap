import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { SPOTIFY_CLIENT_ID, SPOTIFY_DISCOVERY, SPOTIFY_SCOPES } from '../config/spotify';

// Required so the auth browser closes itself and hands the token back to the app
WebBrowser.maybeCompleteAuthSession();

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number; // unix ms
}

export function useSpotifyAuth() {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);

  // wavemap://auth — must be added to your Spotify app's redirect URIs
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'wavemap', path: 'auth' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
      usePKCE: true,
    },
    SPOTIFY_DISCOVERY,
  );

  useEffect(() => {
    if (response?.type !== 'success') return;

    const { code } = response.params;

    // Exchange the auth code for tokens using PKCE verifier (no client secret needed)
    exchangeCode(code, request!.codeVerifier!, redirectUri).then(setTokens);
  }, [response]);

  return { tokens, promptAsync, redirectUri, ready: !!request };
}

async function exchangeCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
