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
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Socket } from 'socket.io-client';
import { UserPin, ReactionPayload, Comment } from 'shared';
import { useComments } from '../hooks/useComments';
import { Ionicons } from '@expo/vector-icons';

const REACTIONS: ReactionPayload['emoji'][] = ['👍', '🔥', '❤️', '🎵'];
const MAX_LENGTH = 280;

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
  const { comments, loading: commentsLoading, postComment } = useComments(socket, pin?.sessionId ?? null);

  function handleReact(emoji: ReactionPayload['emoji']) {
    if (reacted) return; // one reaction per open
    setReacted(emoji);
    onReact(emoji);
    setTimeout(() => setReacted(null), 1000);
  }

  function handleSend() {
    if (!draft.trim()) return;
    postComment(draft.trim());
    setDraft('');
  }

  return (
    <Modal
      visible={pin !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {pin?.track ? (
          <>
            {/* Track */}
            <View style={styles.trackRow}>
              {pin.track.albumArt ? (
                <Image source={{ uri: pin.track.albumArt }} style={styles.albumArt} />
              ) : (
                <View style={[styles.albumArt, styles.albumArtFallback]}>
                  <Ionicons name="musical-notes" size={28} color={MUTED} />
                </View>
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={2}>{pin.track.name}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{pin.track.artist}</Text>
              </View>
            </View>

            {/* Reactions */}
            <View style={styles.reactions}>
              {REACTIONS.map((emoji) => {
                const count = pin.reactions?.[emoji] ?? 0;
                const active = reacted === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiBtn, active && styles.emojiBtnActive]}
                    onPress={() => handleReact(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiChar}>{emoji}</Text>
                    {count > 0 && (
                      <Text style={[styles.reactionCount, active && styles.reactionCountActive]}>
                        {count}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Comments */}
            {commentsLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={SPOTIFY_GREEN} />
              </View>
            ) : (
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
            )}

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment…"
                placeholderTextColor={DIM}
                value={draft}
                onChangeText={setDraft}
                maxLength={MAX_LENGTH}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              {draft.length > 0 && (
                <Text style={[styles.charCount, draft.length > MAX_LENGTH * 0.9 && styles.charCountWarn]}>
                  {MAX_LENGTH - draft.length}
                </Text>
              )}
              <TouchableOpacity
                onPress={handleSend}
                disabled={!draft.trim()}
                style={styles.sendBtn}
              >
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

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <View style={styles.commentRow}>
      <Text style={styles.commentText}>{comment.text}</Text>
      <Text style={styles.commentTime}>{relativeTime(comment.createdAt)}</Text>
    </View>
  );
}

const BG = '#1A1A1A';
const WHITE = '#FFFFFF';
const MUTED = '#B3B3B3';
const DIM = '#555';
const SPOTIFY_GREEN = '#1DB954';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    maxHeight: '82%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  albumArtFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
    gap: 3,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    lineHeight: 20,
  },
  artistName: {
    fontSize: 13,
    color: MUTED,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  emojiBtn: {
    minWidth: 60,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  emojiBtnActive: {
    backgroundColor: SPOTIFY_GREEN,
  },
  emojiChar: {
    fontSize: 24,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
  },
  reactionCountActive: {
    color: '#000',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#333',
    marginBottom: 10,
  },
  loadingRow: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  commentList: {
    maxHeight: 200,
    marginBottom: 10,
  },
  noComments: {
    color: DIM,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
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
    marginTop: 3,
    flexShrink: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  charCount: {
    fontSize: 12,
    color: DIM,
    minWidth: 28,
    textAlign: 'right',
  },
  charCountWarn: {
    color: '#FF6B35',
  },
  sendBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: MUTED,
  },
});
