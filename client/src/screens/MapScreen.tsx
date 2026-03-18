import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';
import type { UserPin } from 'shared';
import { useLocationSocket } from '../hooks/useLocationSocket';

const REACTIONS = ['👍', '🔥', '❤️', '🎵'] as const;

interface Props {
  track?: UserPin['track'];
}

export default function MapScreen({ track }: Props) {
  const { pins, locationGranted, sessionId, sendReaction } = useLocationSocket(track);
  const [selectedPin, setSelectedPin] = useState<UserPin | null>(null);

  if (!locationGranted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Location permission is required to show the map.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.sessionId}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            pinColor={pin.sessionId === sessionId ? '#1DB954' : '#FF6B6B'}
            onPress={() => setSelectedPin(pin)}
          />
        ))}
      </MapView>

      {/* Bottom sheet — shown when a pin is tapped */}
      <Modal
        visible={selectedPin !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPin(null)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSelectedPin(null)}
        />
        {selectedPin && (
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {selectedPin.track ? (
              <View style={styles.trackRow}>
                {selectedPin.track.albumArt ? (
                  <Image source={{ uri: selectedPin.track.albumArt }} style={styles.albumArt} />
                ) : null}
                <View style={styles.trackText}>
                  <Text style={styles.trackName} numberOfLines={2}>
                    {selectedPin.track.name}
                  </Text>
                  <Text style={styles.artist} numberOfLines={1}>
                    {selectedPin.track.artist}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noTrack}>Nothing playing</Text>
            )}

            {/* Emoji reactions */}
            <View style={styles.reactions}>
              {REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionBtn}
                  onPress={() => {
                    sendReaction(selectedPin.sessionId, emoji);
                    setSelectedPin(null);
                  }}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  message: { color: '#b3b3b3', textAlign: 'center', fontSize: 16 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  albumArt: {
    width: 64,
    height: 64,
    borderRadius: 6,
  },
  trackText: { flex: 1, gap: 4 },
  trackName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  artist: { fontSize: 14, color: '#b3b3b3' },
  noTrack: { fontSize: 16, color: '#b3b3b3', textAlign: 'center' },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reactionBtn: {
    backgroundColor: '#2a2a2a',
    borderRadius: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: { fontSize: 28 },
});
