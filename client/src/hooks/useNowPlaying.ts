import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from 'shared';

const POLL_INTERVAL_MS = 30_000; // 30 seconds per Spotify rate-limit guidance
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

export interface NowPlayingState {
  track: Track | null;       // null = authenticated but nothing is playing
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface Options {
  accessToken: string | null;
  /** Called when a 401 is received; should return a fresh token, or null to force re-login */
  onTokenExpired: () => Promise<string | null>;
}

export function useNowPlaying({ accessToken, onTokenExpired }: Options): NowPlayingState {
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ref so the interval callback always sees the latest token without recreating the interval
  const tokenRef = useRef(accessToken);
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);

  const fetchNowPlaying = useCallback(async (token: string): Promise<void> => {
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 204 = Spotify is reachable but the user isn't playing anything
    if (res.status === 204) {
      setTrack(null);
      setLastUpdated(new Date());
      return;
    }

    if (res.status === 401) {
      // Access token expired mid-session — attempt a silent refresh then retry once
      const newToken = await onTokenExpired();
      if (newToken) {
        tokenRef.current = newToken;
        return fetchNowPlaying(newToken);
      }
      // Refresh failed; onTokenExpired already reset auth state — just bail
      return;
    }

    if (!res.ok) {
      throw new Error(`Spotify API error ${res.status}`);
    }

    const data = await res.json();

    // Skip podcasts/episodes — only show music tracks
    if (data.currently_playing_type !== 'track' || !data.item) {
      setTrack(null);
      setLastUpdated(new Date());
      return;
    }

    const item = data.item;
    setTrack({
      id: item.id as string,
      name: item.name as string,
      artist: (item.artists as Array<{ name: string }>).map(a => a.name).join(', '),
      // Spotify returns images sorted largest → smallest; first is highest resolution
      albumArt: (item.album.images as Array<{ url: string }>)[0]?.url ?? '',
      previewUrl: (item.preview_url as string | null) ?? undefined,
    });
    setLastUpdated(new Date());
  }, [onTokenExpired]);

  useEffect(() => {
    if (!accessToken) {
      setTrack(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled || !tokenRef.current) return;
      setIsLoading(true);
      try {
        await fetchNowPlaying(tokenRef.current);
        setError(null);
      } catch {
        if (!cancelled) setError('Could not reach Spotify — will retry');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    poll(); // fetch immediately on login / token change
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [accessToken, fetchNowPlaying]);

  return { track, isLoading, error, lastUpdated };
}
