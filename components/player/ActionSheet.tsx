import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Share,
  Alert,
  Dimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { Track } from "@/services/songsService";
import { usePlayback } from "@/context/PlaybackContext";
import { useAuth } from "@/context/AuthContext";
import { addFavorite } from "@/services/socialService";

const { height: H } = Dimensions.get("window");

interface Props {
  visible?: boolean;
  isVisible?: boolean;
  track: Track | null;
  onClose: () => void;
}

export function ActionSheet({ visible, isVisible, track, onClose }: Props) {
  const sheetOpen = visible ?? isVisible ?? false;

  const insets = useSafeAreaInsets();
  const { downloadTrack } = usePlayback();
  const { user } = useAuth();
  const translateY = useSharedValue(H);
  const opacity = useSharedValue(0);
  

  React.useEffect(() => {
    if (sheetOpen) {
      opacity.value = withSpring(1);
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else {
      opacity.value = withSpring(0);
      translateY.value = withSpring(H, { damping: 18, stiffness: 200 });
    }
  }, [sheetOpen]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        translateY.value = withSpring(H, {}, () => runOnJS(onClose)());
      } else {
        translateY.value = withSpring(0);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: sheetOpen ? ("auto" as const) : ("none" as const),
  }));

  const onShare = async () => {
    if (!track) return;
    try {
      await Share.share({
        message: `Escucha "${track.title}" de ${track.artist} en Ukiyo`,
        url: track.url,
      });
    } catch {}
    onClose();
  };

  const onDownload = async () => {
    if (!track) return;
    try {
      await downloadTrack(track);
      Alert.alert("Descargada", `"${track.title}" guardada offline.`);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo descargar");
    }
    onClose();
  };

  const onPlaylist = () => {
    Alert.alert("Playlists", "Pronto podrás agregar a playlists desde aquí.");
    onClose();
  };

  const onFavorite = async () => {
    if (!track || !user?.nickname || user.isGuest) {
      Alert.alert("Inicia sesión", "Para guardar favoritas en tu perfil.");
      onClose();
      return;
    }
    await addFavorite(user.nickname, {
      id: track.id,
      title: track.title,
      artist: track.artist,
      artwork: track.artwork,
      url: track.url,
    });
    Alert.alert("Guardada", "Añadida a tus favoritas del perfil.");
    onClose();
  };

  const onArtist = () => {
    Alert.alert(track?.artist || "Artista", "Perfil de artista próximamente.");
    onClose();
  };

  if (!track && !sheetOpen) return null;

  const items = [
    { icon: "add-circle-outline" as const, label: "Agregar a Playlist", onPress: onPlaylist },
    { icon: "heart-outline" as const, label: "Favorita en mi perfil", onPress: onFavorite },
    { icon: "download-outline" as const, label: "Descargar", onPress: onDownload },
    { icon: "share-outline" as const, label: "Compartir", onPress: onShare },
    { icon: "person-outline" as const, label: "Ver Artista", onPress: onArtist },
  ];

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sheet, sheetStyle, { paddingBottom: insets.bottom + 16 }]}
        >
          <LiquidGlass intensity={70} borderRadius={28} style={StyleSheet.absoluteFill} />
          <View style={styles.handle} />
          <View style={styles.header}>
            {!!track?.artwork && (
              <Image source={{ uri: track.artwork }} style={styles.art} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {track?.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {track?.artist}
              </Text>
            </View>
          </View>
          {items.map((it) => (
            <Pressable key={it.label} style={styles.row} onPress={it.onPress}>
              <Ionicons name={it.icon} size={24} color="#fff" />
              <Text style={styles.rowText}>{it.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 101,
    paddingTop: 8,
    overflow: "hidden",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  art: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#222" },
  title: { color: "#fff", fontWeight: "700", fontSize: 16 },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  rowText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
