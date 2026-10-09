// components/player/ExpandablePlayer.tsx
import React from "react";
import { Dimensions, StyleSheet, View, Text, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { usePlayback } from "@/context/PlaybackContext";
import { ProgressBar } from "./ProgressBar";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MINI_HEIGHT = 78;
const MAX_TRANSLATE = -(SCREEN_HEIGHT - 100);

export function ExpandablePlayer() {
  const translateY = useSharedValue(0);
  const contextY = useSharedValue(0);
  const { currentTrack, isPlaying, pause, resume } = usePlayback();
  const router = useRouter();

  const gesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = e.translationY + contextY.value;
      translateY.value = Math.max(Math.min(next, 0), MAX_TRANSLATE);
    })
    .onEnd((e) => {
      if (e.velocityY < -600 || translateY.value < MAX_TRANSLATE / 2) {
        translateY.value = withSpring(MAX_TRANSLATE, {
          damping: 18,
          stiffness: 140,
        });
      } else {
        translateY.value = withSpring(0, { damping: 16, stiffness: 160 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => {
    const radius = interpolate(
      translateY.value,
      [MAX_TRANSLATE, 0],
      [36, 22],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY: translateY.value }],
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    };
  });

  if (!currentTrack) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Mini player bar */}
        <View style={styles.mini}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={styles.miniArt}
          />
          <View style={styles.miniInfo}>
            <Text style={styles.miniTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.miniArtist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          <Pressable
            onPress={() => (isPlaying ? pause() : resume())}
            hitSlop={12}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color="#fff"
            />
          </Pressable>
        </View>

        {/* Expanded content */}
        <View style={styles.expanded}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={styles.bigArt}
          />
          <Text style={styles.title}>{currentTrack.title}</Text>
          <Text style={styles.artist}>{currentTrack.artist}</Text>

          <ProgressBar />

          <View style={styles.controls}>
            <Pressable onPress={() => {}}>
              <Ionicons name="play-skip-back" size={32} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => (isPlaying ? pause() : resume())}
              style={styles.playBtn}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={36}
                color="#fff"
              />
            </Pressable>
            <Pressable onPress={() => {}}>
              <Ionicons name="play-skip-forward" size={32} color="#fff" />
            </Pressable>
          </View>

          {/* Karaoke button */}
          <Pressable
            style={styles.karaokeBtn}
            onPress={() => router.push("/player/karaoke")}
          >
            <Ionicons name="mic" size={20} color="#A855F7" />
            <Text style={styles.karaokeText}>Karaoke Lyrics</Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: "rgba(12,8,28,0.82)",
    overflow: "hidden",
    zIndex: 100,
  },
  mini: {
    height: MINI_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  miniArt: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  miniInfo: { flex: 1 },
  miniTitle: { color: "#fff", fontWeight: "600", fontSize: 15 },
  miniArtist: { color: "rgba(255,255,255,0.55)", fontSize: 13 },
  expanded: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  bigArt: {
    width: SCREEN_HEIGHT * 0.32,
    height: SCREEN_HEIGHT * 0.32,
    borderRadius: 20,
    marginBottom: 28,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  artist: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 32,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    marginTop: 28,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(168,85,247,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  karaokeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 36,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(168,85,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.4)",
  },
  karaokeText: {
    color: "#A855F7",
    fontWeight: "600",
    fontSize: 15,
  },
});
