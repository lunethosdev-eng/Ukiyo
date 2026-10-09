import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.box}>
        <Animated.Text entering={FadeInDown} style={styles.title}>
          Iniciar sesión
        </Animated.Text>

        <Text style={styles.label}>Email</Text>
        <LiquidGlass borderRadius={12} intensity={36} style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="rgba(255,255,255,0.28)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </LiquidGlass>

        <Text style={styles.label}>Contraseña</Text>
        <LiquidGlass borderRadius={12} intensity={36} style={styles.field}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.28)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </LiquidGlass>

        <Pressable
          style={[styles.btn, busy && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={busy}
        >
          <Text style={styles.btnText}>Entrar</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Volver</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0c0c0e",
    justifyContent: "center",
  },
  box: { paddingHorizontal: 24 },
  title: {
    color: "#f5f5f7",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 28,
    letterSpacing: -0.5,
  },
  label: {
    color: "rgba(245,245,247,0.55)",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
  },
  field: { marginBottom: 14 },
  input: {
    height: 48,
    paddingHorizontal: 14,
    color: "#f5f5f7",
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#f5f5f7",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#0c0c0e", fontWeight: "700", fontSize: 16 },
  back: {
    color: "rgba(245,245,247,0.45)",
    textAlign: "center",
    marginTop: 20,
  },
});
