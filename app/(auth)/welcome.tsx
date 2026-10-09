import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading, continueAsGuest } = useAuth();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)");
  }, [user, loading]);

  if (loading) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <View style={styles.ambient} />

      <Animated.View entering={FadeIn.duration(600)} style={styles.brand}>
        <View style={styles.mark}>
          <Text style={styles.markLetter}>U</Text>
        </View>
        <Text style={styles.title}>Ukiyo</Text>
        <Text style={styles.subtitle}>Escucha sin límites</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.actions}
      >
        <Animated.View style={anim}>
          <Pressable
            onPressIn={() => {
              scale.value = withSpring(0.97);
            }}
            onPressOut={() => {
              scale.value = withSpring(1);
            }}
            onPress={() => router.push("/(auth)/register")}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>Crear cuenta</Text>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.secondary}
        >
          <LiquidGlass borderRadius={14} intensity={40} style={styles.secondaryInner}>
            <Text style={styles.secondaryText}>Iniciar sesión</Text>
          </LiquidGlass>
        </Pressable>

        <Pressable
          onPress={async () => {
            await continueAsGuest();
            router.replace("/(tabs)");
          }}
        >
          <Text style={styles.guest}>Continuar como invitado</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0c0c0e",
    justifyContent: "space-between",
    paddingBottom: 48,
    paddingTop: 80,
  },
  ambient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121214",
  },
  brand: { alignItems: "center", marginTop: 40 },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#1c1c1e",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  markLetter: { color: "#fff", fontSize: 34, fontWeight: "700" },
  title: {
    color: "#f5f5f7",
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
  },
  subtitle: {
    color: "rgba(245,245,247,0.55)",
    fontSize: 17,
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 28,
    gap: 12,
    width: "100%",
  },
  primary: {
    backgroundColor: "#f5f5f7",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#0c0c0e", fontSize: 17, fontWeight: "600" },
  secondary: { borderRadius: 14, overflow: "hidden" },
  secondaryInner: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { color: "#f5f5f7", fontSize: 17, fontWeight: "600" },
  guest: {
    color: "rgba(245,245,247,0.5)",
    textAlign: "center",
    marginTop: 8,
    fontSize: 15,
  },
});
