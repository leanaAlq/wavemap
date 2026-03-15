import React, { createContext, useContext } from 'react';
import { Track } from 'shared';
import { useSpotifyAuth, SpotifyAuthState } from '../hooks/useSpotifyAuth';
import { useNowPlaying } from '../hooks/useNowPlaying';

interface SpotifyContextValue extends SpotifyAuthState {
  track: Track | null;
  trackLoading: boolean;
  trackError: string | null;
  lastUpdated: Date | null;
}

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

/** Wrap the app with this provider so both tabs share a single auth + now-playing state. */
export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const auth = useSpotifyAuth();
  const nowPlaying = useNowPlaying({
    accessToken: auth.accessToken,
    onTokenExpired: auth.refreshAccessToken,
  });

  return (
    <SpotifyContext.Provider
      value={{
        ...auth,
        track: nowPlaying.track,
        trackLoading: nowPlaying.isLoading,
        trackError: nowPlaying.error,
        lastUpdated: nowPlaying.lastUpdated,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotifyContext(): SpotifyContextValue {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotifyContext must be used inside SpotifyProvider');
  return ctx;
}
