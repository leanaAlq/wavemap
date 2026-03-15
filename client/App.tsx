import { enableScreens } from 'react-native-screens';
// Call before any navigation rendering — required by react-native-screens
enableScreens();

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import MapScreen from './src/screens/MapScreen';

const Tab = createBottomTabNavigator();

const BG = '#121212';
const SPOTIFY_GREEN = '#1DB954';
const MUTED = '#535353';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: BG, borderTopColor: '#2A2A2A' },
            tabBarActiveTintColor: SPOTIFY_GREEN,
            tabBarInactiveTintColor: MUTED,
          }}
        >
          <Tab.Screen
            name="NowPlaying"
            component={NowPlayingScreen}
            options={{
              tabBarLabel: 'Now Playing',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎵</Text>,
            }}
          />
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{
              tabBarLabel: 'Map',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📍</Text>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
