import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NowPlayingScreen from './src/screens/NowPlayingScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NowPlayingScreen />
    </SafeAreaProvider>
  );
}
