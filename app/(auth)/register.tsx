// app/(auth)/register.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AuroraBackground } from "@/components/liquid/AuroraBackground";
import { LiquidGlassCard } from "@/components/liquid/LiquidGlassCard";
import { GlassInput } from "@/components/ui/GlassInput";
import { LiquidButton } from "@/components/liquid/LiquidButton";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AuroraBackground />
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a Ukiyo</Text>

        <LiquidGlassCard style={styles.card}>
          <GlassInput
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <GlassInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <GlassInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <LiquidButton title="Registrarse" onPress={handleRegister} />
        </LiquidGlassCard>

        <Text
          style={styles.link}
          onPress={() => router.back()}
        >
          Ya tengo cuenta
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0618" },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    marginTop: 6,
  },
  card: { padding: 20 },
  link: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },
});
