import { registerRootComponent } from 'expo';
import App from 'expo-router/entry';

// Entry limpio sin react-native-track-player (incompatible con Expo 52 / RN 0.76).
registerRootComponent(App);
