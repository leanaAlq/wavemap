import { StatusBar } from 'expo-status-bar';
import NowPlayingScreen from './src/screens/NowPlayingScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NowPlayingScreen />
    </>
  );
}
