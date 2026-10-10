import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  tint?: "dark" | "light" | "default";
}

/**
 * Glass style: Blur nativo + borde luminoso.
 * El contenido define la altura (no estira al 100%).
 */
export function LiquidGlass({
  children,
  style,
  intensity = 50,
  borderRadius = 20,
  tint = "dark",
}: Props) {
  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      ) : (
        // Android: blur más débil + fondo sólido legible
        <View style={[StyleSheet.absoluteFill, styles.androidBg]} />
      )}
      {Platform.OS === "ios" && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(20,22,30,0.35)" }]} />
      )}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.22)",
          "rgba(255,255,255,0.04)",
          "rgba(255,255,255,0.10)",
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: "rgba(255,255,255,0.22)",
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
    backgroundColor: "rgba(28,30,38,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.14)",
  },
  androidBg: {
    backgroundColor: "rgba(28,30,40,0.88)",
  },
  content: {
    zIndex: 1,
    width: "100%",
    // sin height: '100%' → la caja se adapta al contenido
  },
});
