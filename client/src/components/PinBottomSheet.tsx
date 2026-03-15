import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { UserPin, ReactionPayload } from 'shared';

const EMOJIS: ReactionPayload['emoji'][] = ['👍', '🔥', '❤️', '🎵'];

interface Props {
  pin: UserPin | null;
  onClose: () => void;
  onReact: (emoji: ReactionPayload['emoji']) => void;
}

export function PinBottomSheet({ pin, onClose, onReact }: Props) {
  const [reacted, setReacted] = useState<ReactionPayload['emoji'] | null>(null);

  function handleReact(emoji: ReactionPayload['emoji']) {
    setReacted(emoji);
    onReact(emoji);
    // Reset after a short flash so the user can react again
    setTimeout(() => setReacted(null), 800);
  }

  return (
    <Modal
      visible={pin !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop — tap to dismiss */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {pin?.track ? (
          <>
            <View style={styles.trackRow}>
              {pin.track.albumArt ? (
                <Image source={{ uri: pin.track.albumArt }} style={styles.albumArt} />
              ) : (
                <View style={[styles.albumArt, styles.albumArtFallback]}>
                  <Text style={styles.albumArtFallbackIcon}>🎵</Text>
                </View>
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={2}>{pin.track.name}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{pin.track.artist}</Text>
              </View>
            </View>

            {/* Reaction row */}
            <View style={styles.reactions}>
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBtn, reacted === emoji && styles.emojiBtnActive]}
                  onPress={() => handleReact(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyText}>Nothing playing right now</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const BG = '#1E1E1E';
const WHITE = '#FFFFFF';
const MUTED = '#B3B3B3';
const SPOTIFY_GREEN = '#1DB954';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  albumArt: {
    width: 72,
    height: 72,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  albumArtFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArtFallbackIcon: {
    fontSize: 32,
  },
  trackInfo: {
    flex: 1,
    gap: 4,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: WHITE,
  },
  artistName: {
    fontSize: 14,
    color: MUTED,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emojiBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: {
    backgroundColor: SPOTIFY_GREEN,
  },
  emoji: {
    fontSize: 26,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
  },
});
