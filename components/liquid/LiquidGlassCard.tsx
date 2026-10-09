// components/liquid/LiquidGlassCard.tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
}

/**
 * Reusable Liquid Glass card:
 * - Native BlurView
 * - Thin reflective linear gradient border (thick glass simulation)
 * - Organic rounded corners
 */
export function LiquidGlassCard({
  children,
  style,
  intensity = 45,
  borderRadius = 28,
}: Props) {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />

      {/* Reflective glass edge */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.38)",
          "rgba(255,255,255,0.07)",
          "rgba(255,255,255,0.02)",
          "rgba(255,255,255,0.18)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: 1.2,
            borderColor: "rgba(255,255,255,0.12)",
          },
        ]}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  content: {
    padding: 16,
  },
});
