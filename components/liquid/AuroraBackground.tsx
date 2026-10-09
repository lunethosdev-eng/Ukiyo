// components/liquid/AuroraBackground.tsx
import React, { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import {
  Canvas,
  Fill,
  LinearGradient,
  vec,
  Turbulence,
  Blend,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { usePlayback } from "@/context/PlaybackContext";

const { width, height } = Dimensions.get("window");

/**
 * Animated Aurora background that shifts colors based on the current track artwork palette.
 */
export function AuroraBackground() {
  const { currentTrack } = usePlayback();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  // Fallback to Ukiyo purple palette
  const colors = currentTrack?.colors ?? [
    "#5B21B6",
    "#7C3AED",
    "#A855F7",
    "#3B82F6",
    "#1E1B4B",
  ];

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={colors}
        />
      </Fill>
      <Blend mode="softLight">
        <Turbulence freqX={0.007} freqY={0.007} octaves={4} seed={2} />
      </Blend>
    </Canvas>
  );
}
