// app/(auth)/welcome.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { AuroraBackground } from "@/components/liquid/AuroraBackground";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AuroraBackground />
      <LinearGradient
        colors={["transparent", "rgba(10,6,24,0.85)", "#0A0618"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>U</Text>
        </View>
        <Text style={styles.title}>Ukiyo</Text>
        <Text style={styles.subtitle}>Música que fluye como el agua</Text>

        <LiquidButton
          title="Comenzar"
          onPress={() => router.push("/(auth)/login")}
          style={{ width: width - 64, marginTop: 48 }}
        />
        <Text
          style={styles.link}
          onPress={() => router.push("/(auth)/register")}
        >
          ¿No tienes cuenta? Regístrate
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0618" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoLetter: {
    color: "#fff",
    fontSize: 52,
    fontWeight: "800",
  },
  title: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 17,
    marginTop: 8,
    textAlign: "center",
  },
  link: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 24,
    fontSize: 15,
  },
});
