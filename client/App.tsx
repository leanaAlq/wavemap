import { enableScreens } from 'react-native-screens';
// Call before any navigation rendering — required by react-native-screens
enableScreens();

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import MapScreen from './src/screens/MapScreen';
import { SpotifyProvider } from './src/context/SpotifyContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SpotifyProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: Colors.darkBg, borderTopColor: Colors.grey600 },
            tabBarActiveTintColor: Colors.purple,
            tabBarInactiveTintColor: Colors.grey600,
          }}
        >
          <Tab.Screen
            name="NowPlaying"
            component={NowPlayingScreen}
            options={{
              tabBarLabel: 'Now Playing',
              tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{
              tabBarLabel: 'Map',
              tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      </SpotifyProvider>
    </SafeAreaProvider>
  );
}
