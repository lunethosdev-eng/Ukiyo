import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './services/PlaybackService';
import App from 'expo-router/entry';

// Expo Router registers the app; TrackPlayer's service handles OS media controls.
TrackPlayer.registerPlaybackService(() => PlaybackService);
registerRootComponent(App);
