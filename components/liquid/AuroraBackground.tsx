import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayback } from "@/context/PlaybackContext";

export function AuroraBackground() {
  const { currentTrack } = usePlayback();
  const colors = (currentTrack?.colors?.length
    ? currentTrack.colors
    : ["#5B21B6", "#7C3AED", "#1E1B4B"]) as [string, string, ...string[]];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
