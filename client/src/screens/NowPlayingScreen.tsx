import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Clipboard,
} from 'react-native';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { useNowPlaying } from '../hooks/useNowPlaying';

export default function NowPlayingScreen() {
  const { accessToken, isLoading: authLoading, error: authError, redirectUri, login, logout, refreshAccessToken } =
    useSpotifyAuth();

  const { track, isLoading: trackLoading, error: trackError, lastUpdated } = useNowPlaying({
    accessToken,
    onTokenExpired: refreshAccessToken,
  });

  // --- Loading state while we check SecureStore for a stored token ---
  if (authLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={SPOTIFY_GREEN} />
      </SafeAreaView>
    );
  }

  // --- Login screen ---
  if (!accessToken) {
    // Warn if Expo Go is being used — exp:// scheme won't work with Spotify
    const isExpoGo = redirectUri.startsWith('exp://');

    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.appTitle}>Wavemap</Text>
        <Text style={styles.subtitle}>Share what you're listening to</Text>
        <TouchableOpacity style={styles.loginButton} onPress={login} activeOpacity={0.85}>
          <Text style={styles.loginButtonText}>Login with Spotify</Text>
        </TouchableOpacity>
        {authError ? <Text style={styles.error}>{authError}</Text> : null}

        {/* Redirect URI panel — always visible so you can add the exact URI to Spotify */}
        <View style={styles.redirectBox}>
          <Text style={styles.redirectLabel}>Redirect URI for Spotify dashboard</Text>
          <TouchableOpacity
            onPress={() => Clipboard.setString(redirectUri)}
            activeOpacity={0.7}
          >
            <Text style={styles.redirectUri}>{redirectUri}</Text>
            <Text style={styles.redirectCopyHint}>tap to copy</Text>
          </TouchableOpacity>

          {isExpoGo && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️  Expo Go generates an{' '}
                <Text style={styles.warningCode}>exp://</Text> URI that
                Spotify rejects. Run a development build to get{' '}
                <Text style={styles.warningCode}>wavemap://</Text> instead:
              </Text>
              <Text style={styles.warningCode}>
                {'npx expo run:ios\nnpx expo run:android'}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- Now Playing screen ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity onPress={logout} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {trackError ? (
          <Text style={styles.error}>{trackError}</Text>
        ) : null}

        {/* Show spinner on the very first load before we have any data */}
        {trackLoading && !track && !lastUpdated ? (
          <ActivityIndicator size="large" color={SPOTIFY_GREEN} />
        ) : null}

        {/* Nothing playing state */}
        {!trackLoading && !track && lastUpdated ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyHeading}>Nothing playing</Text>
            <Text style={styles.emptyBody}>Open Spotify and start a track</Text>
          </View>
        ) : null}

        {/* Track card */}
        {track ? (
          <View style={styles.trackCard}>
            {track.albumArt ? (
              <Image
                source={{ uri: track.albumArt }}
                style={styles.albumArt}
                accessibilityLabel={`Album art for ${track.name}`}
              />
            ) : (
              // Fallback when Spotify returns no image URL
              <View style={[styles.albumArt, styles.albumArtFallback]}>
                <Text style={styles.albumArtFallbackIcon}>🎵</Text>
              </View>
            )}
            <Text style={styles.trackName} numberOfLines={2}>
              {track.name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {track.artist}
            </Text>
            {lastUpdated ? (
              <Text style={styles.timestamp}>
                Updated {lastUpdated.toLocaleTimeString()}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const SPOTIFY_GREEN = '#1DB954';
const BG = '#121212';
const SURFACE = '#1E1E1E';
const WHITE = '#FFFFFF';
const MUTED = '#B3B3B3';
const DIM = '#535353';

const styles = StyleSheet.create({
  // Shared between login and now-playing
  centerContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  // Now-playing layout
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: WHITE,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  // Login screen elements
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: WHITE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MUTED,
    marginBottom: 48,
  },
  loginButton: {
    backgroundColor: SPOTIFY_GREEN,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Track card
  trackCard: {
    alignItems: 'center',
    width: '100%',
  },
  albumArt: {
    width: 260,
    height: 260,
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: SURFACE, // shown while image loads
  },
  albumArtFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArtFallbackIcon: {
    fontSize: 80,
  },
  trackName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  artistName: {
    fontSize: 16,
    color: MUTED,
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: DIM,
    marginTop: 16,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 8,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: WHITE,
  },
  emptyBody: {
    fontSize: 14,
    color: MUTED,
  },

  // Redirect URI debug panel
  redirectBox: {
    marginTop: 40,
    padding: 16,
    borderRadius: 8,
    backgroundColor: SURFACE,
    width: '100%',
    gap: 8,
  },
  redirectLabel: {
    fontSize: 11,
    color: DIM,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  redirectUri: {
    fontSize: 13,
    color: SPOTIFY_GREEN,
    fontFamily: 'monospace' as const,
    flexWrap: 'wrap',
  },
  redirectCopyHint: {
    fontSize: 11,
    color: DIM,
    marginTop: 4,
  },
  warningBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#2A1F00',
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#FFB347',
    lineHeight: 18,
  },
  warningCode: {
    fontSize: 12,
    color: '#FFD580',
    fontFamily: 'monospace' as const,
  },

  // Shared
  logoutText: {
    color: MUTED,
    fontSize: 14,
  },
  error: {
    color: '#FF4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
