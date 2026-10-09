// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidGlassCard } from "@/components/liquid/LiquidGlassCard";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>U</Text>
        </View>
        <Text style={styles.name}>Usuario Ukiyo</Text>
        <Text style={styles.email}>user@ukiyo.app</Text>
      </View>

      <LiquidGlassCard style={styles.card}>
        <Text style={styles.rowLabel}>Plan</Text>
        <Text style={styles.rowValue}>Ukiyo Free</Text>
      </LiquidGlassCard>

      <LiquidGlassCard style={styles.card}>
        <Text style={styles.rowLabel}>Descargas</Text>
        <Text style={styles.rowValue}>Ilimitadas offline</Text>
      </LiquidGlassCard>

      <LiquidButton
        title="Cerrar sesión"
        onPress={() => router.replace("/(auth)/welcome")}
        style={{ marginHorizontal: 28, marginTop: 32 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0618" },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginLeft: 20,
    marginTop: 12,
  },
  center: { alignItems: "center", marginVertical: 32 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarLetter: { color: "#fff", fontSize: 42, fontWeight: "800" },
  name: { color: "#fff", fontSize: 22, fontWeight: "700" },
  email: { color: "rgba(255,255,255,0.45)", marginTop: 4 },
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { color: "rgba(255,255,255,0.6)", fontSize: 15 },
  rowValue: { color: "#fff", fontWeight: "600" },
});
