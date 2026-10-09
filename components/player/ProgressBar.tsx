// components/player/ProgressBar.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePlayback } from "@/context/PlaybackContext";

/**
 * Progress bar that thickens organically while dragging (Liquid Glass feel).
 */
export function ProgressBar() {
  const { position, duration, seekTo } = usePlayback();
  const isDragging = useSharedValue(0);
  const dragProgress = useSharedValue(0);

  const progress = duration > 0 ? position / duration : 0;

  const gesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = withSpring(1, { damping: 15, stiffness: 200 });
      dragProgress.value = progress;
    })
    .onUpdate((e) => {
      // Approximate width ≈ screen - 56
      const width = 340;
      const next = Math.max(0, Math.min(1, dragProgress.value + e.translationX / width));
      dragProgress.value = next;
    })
    .onEnd(() => {
      isDragging.value = withSpring(0);
      seekTo(dragProgress.value * duration);
    });

  const barStyle = useAnimatedStyle(() => ({
    height: withSpring(isDragging.value ? 10 : 4, {
      damping: 14,
      stiffness: 220,
    }),
    borderRadius: 5,
  }));

  const fillWidth = isDragging.value ? dragProgress : progress;

  const fillStyle = useAnimatedStyle(() => ({
    width: `${(isDragging.value ? dragProgress.value : progress) * 100}%`,
  }));

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={gesture}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, barStyle, fillStyle]} />
        </View>
      </GestureDetector>
      <View style={styles.times}>
        <Text style={styles.time}>{format(position)}</Text>
        <Text style={styles.time}>{format(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginTop: 8 },
  track: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "center",
  },
  fill: {
    backgroundColor: "#A855F7",
    height: 4,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  time: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
  },
});
