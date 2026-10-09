import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from "react-native";
import { BlurView } from "expo-blur";

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  tint?: "dark" | "light" | "default" | "systemMaterialDark";
}

/**
 * Liquid Glass real (estilo Apple):
 * - BlurView nativo
 * - Borde hairline semi-transparente
 * - Sin gradientes de color ni caja opaca detrás
 */
export function LiquidGlass({
  children,
  style,
  intensity = 64,
  borderRadius = 20,
  tint = "dark",
}: Props) {
  return (
    <View style={[styles.outer, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint as any}
        experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "rgba(255,255,255,0.22)",
            backgroundColor: "rgba(255,255,255,0.04)",
          },
        ]}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  inner: {
    zIndex: 1,
  },
});
