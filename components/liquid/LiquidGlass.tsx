import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  tint?: "dark" | "light" | "default";
}

/** Liquid Glass real: blur nativo + borde reflectante fino, sin caja opaca detrás */
export function LiquidGlass({
  children,
  style,
  intensity = 55,
  borderRadius = 24,
  tint = "dark",
}: Props) {
  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.22)",
          "rgba(255,255,255,0.04)",
          "rgba(255,255,255,0.08)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: "rgba(255,255,255,0.18)",
          },
        ]}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  content: {
    zIndex: 1,
  },
});
