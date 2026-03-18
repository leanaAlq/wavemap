import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { UserPin } from 'shared';
import { useLocationSocket } from '../hooks/useLocationSocket';

interface Props {
  track?: UserPin['track'];
}

export default function MapScreen({ track }: Props) {
  const { pins, locationGranted, sessionId } = useLocationSocket(track);

  if (!locationGranted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Location permission is required to show the map.
        </Text>
      </View>
    );
  }

  return (
    <MapView style={styles.map} showsUserLocation={false} showsMyLocationButton={false}>
      {pins.map((pin) => (
        <Marker
          key={pin.sessionId}
          coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
          pinColor={pin.sessionId === sessionId ? '#1DB954' : '#FF6B6B'}
          title={pin.track?.name ?? 'No track'}
          description={pin.track ? `${pin.track.artist}` : undefined}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  message: {
    color: '#b3b3b3',
    textAlign: 'center',
    fontSize: 16,
  },
});
