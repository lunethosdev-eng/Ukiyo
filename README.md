# Ukiyo 🌊

Aplicación de música móvil con estética **Liquid Glass**, inspirada en Apple Music.

## Características

- **Liquid Glass UI**: BlurView + gradientes reflectantes + Gooey effect (Skia)
- **Físicas de resorte**: Reanimated + Gesture Handler en carruseles y BottomSheet
- **Reproductor expandible** con radio de borde dinámico
- **Karaoke Lyrics**: pantalla difuminada del cover + coloreado letra por letra a 1.2× velocidad
- **Offline-first**: NetInfo + AsyncStorage + expo-file-system
- **Seki API** con timeout estricto de 4 minutos
- **CI/CD** listo con GitHub Actions (firma de APK)

## Iconos

- `assets/icon.png` / `adaptive-icon.png` → launcher (fondo azul)
- `assets/splash-icon.png` → dentro de la app (fondo negro)

## Arranque rápido

```bash
npm install
npx expo start
```

## Build de producción (Android)

El workflow `.github/workflows/build.yml` hace:

1. `npx expo prebuild --platform android --clean`
2. `./gradlew assembleRelease`
3. Firma con `r0adkll/sign-android-release@v1`
4. Sube el APK firmado como artefacto

Secretos necesarios en GitHub:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

## Estructura

```
app/                  # Expo Router
components/liquid/    # Liquid Glass system
components/karaoke/   # Karaoke lyrics
components/player/    # Expandable player + progress
context/              # Playback + offline
services/             # Seki API + LRCLIB
```

## Config

Ver `constants/Config.ts` (traducción de tu Config.kt original).
