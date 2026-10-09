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
  intensity = 35, // Menos opaco, más "líquido"
  borderRadius = 24,
  tint = "dark",
}: Props) {
  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      {/* Fondo de desenfoque base */}
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      
      {/* Capa sutil de tinte para asimilar el material de iOS */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.03)" }]} />

      {/* Reflejo asimétrico del cristal (Luz arriba izquierda, sombra abajo derecha) */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.4)",  // Brillo fuerte superior
          "rgba(255,255,255,0.0)",  // Transparencia en medio
          "rgba(255,255,255,0.05)", // Ligero reflejo inferior
        ]}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.15)",
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
  content: { zIndex: 1 },
});
