import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onNickname = useCallback((t: string) => {
    setNickname(t.replace(/\s/g, "").toLowerCase());
  }, []);

  const onSubmit = async () => {
    if (!name.trim() || !nickname.trim() || !email.trim() || password.length < 4) {
      Alert.alert("Completa todos los campos", "Nombre, nickname, email y contraseña (mín. 4).");
      return;
    }
    setBusy(true);
    try {
      await register({ name, nickname, email, password });
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo registrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Animated.Text entering={FadeInDown} style={styles.title}>
          Crear cuenta
        </Animated.Text>
        <Text style={styles.hint}>
          Elige un nickname. Luego podrás editar foto, banner y privacidad.
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <LiquidGlass borderRadius={14} intensity={40} style={styles.field}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </LiquidGlass>

        <Text style={styles.label}>Nickname</Text>
        <LiquidGlass borderRadius={14} intensity={40} style={styles.field}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={onNickname}
            placeholder="ukiyo_user"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </LiquidGlass>

        <Text style={styles.label}>Email</Text>
        <LiquidGlass borderRadius={14} intensity={40} style={styles.field}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </LiquidGlass>

        <Text style={styles.label}>Contraseña</Text>
        <LiquidGlass borderRadius={14} intensity={40} style={styles.field}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry
            autoCorrect={false}
          />
        </LiquidGlass>

        <Pressable
          style={[styles.btn, busy && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={busy}
        >
          <Text style={styles.btnText}>{busy ? "Creando…" : "Crear cuenta"}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.back}>Ya tengo cuenta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  scroll: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  hint: { color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 24, lineHeight: 20 },
  label: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 8, marginTop: 12 },
  field: { marginBottom: 4 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
  },
  btn: {
    marginTop: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnText: { color: "#000", fontWeight: "700", fontSize: 16 },
  back: { color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14 },
});
