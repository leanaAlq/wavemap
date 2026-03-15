import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { UserPin } from 'shared';
import { useSocket } from '../hooks/useSocket';
import { useLocation } from '../hooks/useLocation';
import { getSessionId } from '../hooks/useSessionId';

const INITIAL_REGION: Region = {
  // Default to London — overridden immediately on first GPS fix
  latitude: 51.505,
  longitude: -0.09,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const SPOTIFY_GREEN = '#1DB954';
const PIN_OTHER = '#FF4444';

export default function MapScreen() {
  const { pins, connected, socket } = useSocket();
  const mapRef = useRef<MapView>(null);

  // Start emitting location updates as soon as we have a socket
  useLocation({ socket });

  // Centre the map on the user's actual position once on mount
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={false} // we draw our own pin so colours are consistent
      >
        {pins.map((pin) => (
          <PinMarker key={pin.sessionId} pin={pin} />
        ))}
      </MapView>

      {/* Connection status badge */}
      <View style={[styles.badge, connected ? styles.badgeConnected : styles.badgeDisconnected]}>
        <Text style={styles.badgeText}>
          {connected ? `● ${pins.length} online` : '○ reconnecting…'}
        </Text>
      </View>
    </View>
  );
}

// Separate component so React can key it cleanly and avoid re-rendering all pins
// when only one changes.
function PinMarker({ pin }: { pin: UserPin }) {
  const [ownId, setOwnId] = React.useState<string | null>(null);

  useEffect(() => {
    getSessionId().then(setOwnId);
  }, []);

  const isOwn = ownId !== null && pin.sessionId === ownId;

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      pinColor={isOwn ? SPOTIFY_GREEN : PIN_OTHER}
      title={isOwn ? 'You' : 'Wavemap user'}
      description={pin.track ? `${pin.track.name} — ${pin.track.artist}` : undefined}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeConnected: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  badgeDisconnected: {
    backgroundColor: 'rgba(80,0,0,0.7)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
