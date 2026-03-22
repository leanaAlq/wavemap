import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { UserPin, ReactionPayload } from 'shared';
import { useSocket } from '../hooks/useSocket';
import { useLocation } from '../hooks/useLocation';
import { useSpotifyContext } from '../context/SpotifyContext';
import { getSessionId } from '../hooks/useSessionId';
import { PinBottomSheet } from '../components/PinBottomSheet';
import { Colors } from '../theme';

const INITIAL_REGION: Region = {
  latitude: 55.9441,
  longitude: -3.1867,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};


// Google Maps dark style — mutes roads/labels and shifts palette to deep purple-grey
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A0A2E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A78BFA' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A0A2E' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2D1B5E' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1A0A2E' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4C1D95' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0C0520' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#A78BFA' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#241242' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1A1040' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2D1B5E' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3B1F6E' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#C4B5FD' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#C4B5FD' }] },
];

export default function MapScreen() {
  const { track } = useSpotifyContext();
  const { pins, connected, socket } = useSocket();
  const mapRef = useRef<MapView>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  // Derive from live pins so reaction counts update without reopening the sheet
  const selectedPin = selectedPinId ? (pins.find(p => p.sessionId === selectedPinId) ?? null) : null;

  // Emit GPS + current track every 15 s
  useLocation({ socket, track });

  // Centre map on user's position once on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  function handleReact(emoji: ReactionPayload['emoji']) {
    if (!selectedPin) return;
    socket?.emit('reaction', {
      pinSessionId: selectedPin.sessionId,
      emoji,
    } satisfies ReactionPayload);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        userInterfaceStyle="dark"
        customMapStyle={DARK_MAP_STYLE}
      >
        {pins.map((pin) => (
          <PinMarker
            key={pin.sessionId}
            pin={pin}
            onPress={() => setSelectedPinId(pin.sessionId)}
          />
        ))}
      </MapView>

      <View style={[styles.badge, connected ? styles.badgeConnected : styles.badgeDisconnected]}>
        <Text style={styles.badgeText}>
          {connected ? `● ${pins.length} online` : '○ reconnecting…'}
        </Text>
      </View>

      <PinBottomSheet
        pin={selectedPin}
        socket={socket}
        onClose={() => setSelectedPinId(null)}
        onReact={handleReact}
      />
    </View>
  );
}

function PinMarker({ pin, onPress }: { pin: UserPin; onPress: () => void }) {
  const [ownId, setOwnId] = useState<string | null>(null);

  useEffect(() => {
    getSessionId().then(setOwnId);
  }, []);

  const isOwn = ownId !== null && pin.sessionId === ownId;

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      pinColor={isOwn ? Colors.purple : Colors.pink}
      // No title/description — suppresses the native callout so the custom
      // bottom sheet is the only UI that appears on tap
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeConnected: { backgroundColor: 'rgba(124,58,237,0.8)' },
  badgeDisconnected: { backgroundColor: 'rgba(219,39,119,0.8)' },
  badgeText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
});
