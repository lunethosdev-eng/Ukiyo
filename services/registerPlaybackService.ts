import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './PlaybackService';

// Importar este archivo una sola vez desde el entrypoint nativo de la app.
TrackPlayer.registerPlaybackService(() => PlaybackService);
