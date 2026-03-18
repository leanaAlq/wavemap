import { useEffect, useRef, useState } from 'react';

export interface NowPlayingTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string | null;
  isPlaying: boolean;
}

const POLL_INTERVAL_MS = 30_000;

export function useNowPlaying(accessToken: string | null) {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setTrack(null);
      return;
    }

    // Fetch immediately then on interval
    fetchNowPlaying(accessToken).then(setTrack).catch((e) => setError(e.message));

    timerRef.current = setInterval(() => {
      fetchNowPlaying(accessToken).then(setTrack).catch((e) => setError(e.message));
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [accessToken]);

  return { track, error };
}

async function fetchNowPlaying(accessToken: string): Promise<NowPlayingTrack | null> {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 204 = nothing playing
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);

  const data = await res.json();
  if (!data?.item) return null;

  const artists = data.item.artists.map((a: { name: string }) => a.name).join(', ');
  const images: { url: string }[] = data.item.album?.images ?? [];

  return {
    id: data.item.id,
    name: data.item.name,
    artist: artists,
    albumArt: images[0]?.url ?? null,
    isPlaying: data.is_playing,
  };
}
