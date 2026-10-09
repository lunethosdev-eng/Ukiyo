import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)");
    }
  }, [user, loading]);

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Ukiyo</Text>
      <Text style={styles.sub}>Tu música</Text>

      <Pressable
        style={styles.primary}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.primaryText}>Continuar</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Crear cuenta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: { color: "#fff", fontSize: 44, fontWeight: "700", letterSpacing: -1 },
  sub: { color: "rgba(255,255,255,0.45)", marginTop: 8, marginBottom: 48 },
  primary: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
  },
  primaryText: { color: "#000", fontWeight: "700", fontSize: 16 },
  link: {
    color: "rgba(255,255,255,0.55)",
    marginTop: 20,
    fontSize: 15,
  },
});
