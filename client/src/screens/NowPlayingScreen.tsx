import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNowPlaying } from '../hooks/useNowPlaying';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

export default function NowPlayingScreen() {
  const { tokens, promptAsync, ready } = useSpotifyAuth();
  const { track, error } = useNowPlaying(tokens?.accessToken ?? null);

  if (!tokens) {
    return (
      <View style={styles.center}>
        <Text style={styles.appTitle}>Wavemap</Text>
        <TouchableOpacity
          style={[styles.loginButton, !ready && styles.disabled]}
          onPress={() => promptAsync()}
          disabled={!ready}
        >
          <Text style={styles.loginText}>Connect Spotify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (track === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (track === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>Nothing playing right now</Text>
        <Text style={styles.hint}>Play something on Spotify and come back</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {track.albumArt && (
        <Image source={{ uri: track.albumArt }} style={styles.albumArt} />
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={2}>{track.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, track.isPlaying ? styles.dotPlaying : styles.dotPaused]} />
          <Text style={styles.statusText}>{track.isPlaying ? 'Playing' : 'Paused'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 48,
    letterSpacing: 2,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
  },
  loginText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: 8,
  },
  trackInfo: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  trackName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  artist: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotPlaying: { backgroundColor: '#1DB954' },
  dotPaused: { backgroundColor: '#b3b3b3' },
  statusText: {
    color: '#b3b3b3',
    fontSize: 13,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
