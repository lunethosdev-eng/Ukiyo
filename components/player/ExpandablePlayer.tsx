import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePlayback } from "@/context/PlaybackContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: H, width: W } = Dimensions.get("window");
const MINI_H = 64;
const TAB_CLEARANCE = 78;

export function ExpandablePlayer() {
  const { currentTrack, isPlaying, togglePlay, position, duration, seek } =
    usePlayback();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const expand = useSharedValue(0);
  const start = useSharedValue(0);

  const openKaraoke = useCallback(() => {
    try {
      router.push("/player/karaoke");
    } catch {}
  }, [router]);

  const pan = Gesture.Pan()
    .onStart(() => {
      start.value = expand.value;
    })
    .onUpdate((e) => {
      const next = start.value - e.translationY / (H * 0.7);
      expand.value = Math.min(1, Math.max(0, next));
    })
    .onEnd((e) => {
      const shouldOpen = e.velocityY < -400 || expand.value > 0.35;
      expand.value = withSpring(shouldOpen ? 1 : 0, {
        damping: 22,
        stiffness: 180,
      });
    });

  const sheetStyle = useAnimatedStyle(() => {
    const bottom = interpolate(
      expand.value,
      [0, 1],
      [TAB_CLEARANCE + Math.max(insets.bottom, 8), 0]
    );
    const h = interpolate(expand.value, [0, 1], [MINI_H, H]);
    const radius = interpolate(expand.value, [0, 1], [16, 0]);
    const mx = interpolate(expand.value, [0, 1], [12, 0]);
    return {
      position: "absolute" as const,
      left: mx,
      right: mx,
      bottom,
      height: h,
      borderRadius: radius,
      overflow: "hidden" as const,
      zIndex: 50,
    };
  });

  const miniStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expand.value, [0, 0.25], [1, 0]),
  }));
  const fullStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expand.value, [0.35, 0.7], [0, 1]),
  }));

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={sheetStyle}>
        <LiquidGlass
          intensity={80}
          borderRadius={0}
          style={StyleSheet.absoluteFill}
        />

        {/* MINI */}
        <Animated.View style={[styles.mini, miniStyle]}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={styles.miniArt}
          />
          <View style={styles.miniMeta}>
            <Text style={styles.miniTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.miniArtist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <Pressable onPress={togglePlay} hitSlop={12}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#f5f5f7"
            />
          </Pressable>
        </Animated.View>

        {/* FULL */}
        <Animated.View style={[styles.full, fullStyle]} pointerEvents="box-none">
          <View style={styles.handle} />
          <Image
            source={{ uri: currentTrack.artwork }}
            style={styles.fullArt}
          />
          <Text style={styles.fullTitle}>{currentTrack.title}</Text>
          <Text style={styles.fullArtist}>{currentTrack.artist}</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.controls}>
            <Pressable onPress={togglePlay} style={styles.playBtn}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={36}
                color="#0c0c0e"
              />
            </Pressable>
          </View>

          <Pressable onPress={openKaraoke}>
            <Text style={styles.lyricsLink}>Letras</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  mini: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: MINI_H,
    gap: 12,
  },
  miniArt: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#1c1c1e",
  },
  miniMeta: { flex: 1 },
  miniTitle: { color: "#f5f5f7", fontSize: 14, fontWeight: "600" },
  miniArtist: { color: "rgba(245,245,247,0.5)", fontSize: 12, marginTop: 2 },
  full: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 28,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 24,
  },
  fullArt: {
    width: W * 0.72,
    height: W * 0.72,
    borderRadius: 12,
    backgroundColor: "#1c1c1e",
    marginTop: 24,
  },
  fullTitle: {
    color: "#f5f5f7",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 28,
    textAlign: "center",
  },
  fullArtist: {
    color: "rgba(245,245,247,0.55)",
    fontSize: 16,
    marginTop: 6,
  },
  barTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    marginTop: 32,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#f5f5f7",
  },
  controls: { marginTop: 28 },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  lyricsLink: {
    color: "rgba(245,245,247,0.55)",
    marginTop: 24,
    fontSize: 15,
    fontWeight: "500",
  },
});
