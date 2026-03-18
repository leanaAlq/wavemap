import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { useSpotifyAuth } from './src/hooks/useSpotifyAuth';
import { useNowPlaying } from './src/hooks/useNowPlaying';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import MapScreen from './src/screens/MapScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  // Lifted here so the current track is shared between both tabs
  const { tokens, promptAsync, ready } = useSpotifyAuth();
  const { track, error: trackError } = useNowPlaying(tokens?.accessToken ?? null);

  // Convert NowPlayingTrack → shared Track shape for the socket payload
  const socketTrack = track
    ? { id: track.id, name: track.name, artist: track.artist, albumArt: track.albumArt ?? '' }
    : undefined;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#121212', borderTopColor: '#333' },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen
          name="Now Playing"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎵</Text> }}
        >
          {() => (
            <NowPlayingScreen
              tokens={tokens}
              promptAsync={promptAsync}
              ready={ready}
              track={track}
              error={trackError}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Map"
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text> }}
        >
          {() => <MapScreen track={socketTrack} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
