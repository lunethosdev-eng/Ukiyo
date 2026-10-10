import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/context/AuthContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading, continueAsGuest } = useAuth();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)");
  }, [user, loading]);

  const logoAnim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const onGuest = async () => {
    await continueAsGuest();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0a0612", "#1a0a2e", "#0d0818", "#000"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Orbes decorativos */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(800)} style={logoAnim}>
          <LiquidGlass borderRadius={28} intensity={55} style={styles.logoBox}>
            <Text style={styles.logoU}>U</Text>
          </LiquidGlass>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150).springify()} style={styles.title}>
          Ukiyo
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(250)} style={styles.subtitle}>
          Escucha sin límites
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actions}>
        <Pressable
          style={styles.primary}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.primaryText}>Crear cuenta</Text>
        </Pressable>

        <LiquidGlass borderRadius={16} intensity={40} style={styles.secondaryWrap}>
          <Pressable style={styles.secondary} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.secondaryText}>Iniciar sesión</Text>
          </Pressable>
        </LiquidGlass>

        <Pressable onPress={onGuest} hitSlop={12}>
          <Text style={styles.guest}>Continuar como invitado</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", justifyContent: "space-between" },
  orb1: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width,
    backgroundColor: "rgba(109,40,217,0.18)",
    top: -width * 0.15,
    right: -width * 0.2,
  },
  orb2: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width,
    backgroundColor: "rgba(167,139,250,0.10)",
    bottom: height * 0.25,
    left: -width * 0.15,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
  logoBox: { width: 88, height: 88, alignItems: "center", justifyContent: "center" },
  logoU: { color: "#fff", fontSize: 40, fontWeight: "700", letterSpacing: -1 },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
    marginTop: 20,
    letterSpacing: -1.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 16,
    marginTop: 8,
    fontWeight: "500",
  },
  actions: { paddingHorizontal: 28, paddingBottom: 48, gap: 12 },
  primary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: { color: "#000", fontSize: 16, fontWeight: "700" },
  secondaryWrap: { overflow: "hidden" },
  secondary: { paddingVertical: 16, alignItems: "center" },
  secondaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  guest: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
