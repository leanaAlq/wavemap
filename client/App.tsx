import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import NowPlayingScreen from './src/screens/NowPlayingScreen';
import MapScreen from './src/screens/MapScreen';

const Tab = createBottomTabNavigator();

export default function App() {
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
          component={NowPlayingScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎵</Text> }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
