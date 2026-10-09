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

export function LiquidGlass({
  children,
  style,
  intensity = 45,
  borderRadius = 24,
  tint = "dark",
}: Props) {
  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      {/* Fondo nativo optimizado */}
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Tinte Apple UI Glass */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.06)" }]} />

      {/* Reflejo biselado tridimensional del cristal */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.45)",
          "rgba(255,255,255,0.0)",
          "rgba(255,255,255,0.08)",
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: 1.2,
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
  wrap: { overflow: "hidden", backgroundColor: "transparent" },
  content: { zIndex: 1, width: "100%", height: "100%" },
});
