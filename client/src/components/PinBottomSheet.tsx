import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Socket } from 'socket.io-client';
import { UserPin, ReactionPayload, Comment } from 'shared';
import { useComments } from '../hooks/useComments';

const REACTIONS: { emoji: ReactionPayload['emoji']; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { emoji: '👍', icon: 'thumbs-up' },
  { emoji: '🔥', icon: 'flame' },
  { emoji: '❤️', icon: 'heart' },
  { emoji: '🎵', icon: 'musical-note' },
];

interface Props {
  pin: UserPin | null;
  socket: Socket | null;
  onClose: () => void;
  onReact: (emoji: ReactionPayload['emoji']) => void;
}

export function PinBottomSheet({ pin, socket, onClose, onReact }: Props) {
  const [reacted, setReacted] = useState<ReactionPayload['emoji'] | null>(null);
  const [draft, setDraft] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { comments, postComment } = useComments(socket, pin?.sessionId ?? null);

  function handleReact(emoji: ReactionPayload['emoji']) {
    setReacted(emoji);
    onReact(emoji);
    setTimeout(() => setReacted(null), 800);
  }

  function handleSend() {
    if (!draft.trim()) return;
    postComment(draft);
    setDraft('');
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {pin?.track ? (
          <>
            {/* Track row */}
            <View style={styles.trackRow}>
              {pin.track.albumArt ? (
                <Image source={{ uri: pin.track.albumArt }} style={styles.albumArt} />
              ) : (
                <View style={[styles.albumArt, styles.albumArtFallback]}>
                  <Ionicons name="musical-note" size={32} color={MUTED} />
                </View>
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={2}>{pin.track.name}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{pin.track.artist}</Text>
              </View>
            </View>

            {/* Reaction row */}
            <View style={styles.reactions}>
              {REACTIONS.map(({ emoji, icon }) => {
                const count = pin?.reactions?.[emoji] ?? 0;
                const active = reacted === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiBtn, active && styles.emojiBtnActive]}
                    onPress={() => handleReact(emoji)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={icon} size={22} color={active ? '#000' : SPOTIFY_GREEN} />
                    {count > 0 && (
                      <Text style={[styles.reactionCount, active && styles.reactionCountActive]}>
                        {count}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Comments */}
            <View style={styles.divider} />
            <FlatList
              ref={flatListRef}
              data={comments}
              keyExtractor={c => c.id}
              style={styles.commentList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                <Text style={styles.noComments}>No comments yet — be the first</Text>
              }
              renderItem={({ item }) => <CommentRow comment={item} />}
            />

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment…"
                placeholderTextColor={DIM}
                value={draft}
                onChangeText={setDraft}
                maxLength={280}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity onPress={handleSend} disabled={!draft.trim()} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color={draft.trim() ? SPOTIFY_GREEN : DIM} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes" size={48} color={MUTED} />
            <Text style={styles.emptyText}>Nothing playing right now</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const time = new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.commentRow}>
      <Text style={styles.commentText}>{comment.text}</Text>
      <Text style={styles.commentTime}>{time}</Text>
    </View>
  );
}

const BG = '#1E1E1E';
const WHITE = '#FFFFFF';
const MUTED = '#B3B3B3';
const DIM = '#535353';
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
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: '80%',
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
    marginBottom: 20,
  },
  albumArt: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  albumArtFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    gap: 4,
  },
  trackName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: WHITE,
  },
  artistName: {
    fontSize: 13,
    color: MUTED,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  reactionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: SPOTIFY_GREEN,
    marginTop: 2,
  },
  reactionCountActive: {
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginBottom: 12,
  },
  commentList: {
    maxHeight: 180,
    marginBottom: 12,
  },
  noComments: {
    color: DIM,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2A',
    gap: 8,
  },
  commentText: {
    flex: 1,
    fontSize: 14,
    color: WHITE,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 11,
    color: DIM,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2A',
    paddingTop: 12,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: WHITE,
  },
  sendBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
  },
});
