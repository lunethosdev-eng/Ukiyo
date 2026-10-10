import { registerRootComponent } from 'expo';
import App from 'expo-router/entry';

// Registrar TrackPlayer de forma segura.
// Si el módulo nativo falla (New Architecture, link roto, etc.) la app NO se cierra.
try {
  const TrackPlayer = require('react-native-track-player').default;
  const { PlaybackService } = require('./services/PlaybackService');
  TrackPlayer.registerPlaybackService(() => PlaybackService);
} catch (e) {
  console.warn('[Ukiyo] TrackPlayer no disponible en este build:', e);
}

registerRootComponent(App);
