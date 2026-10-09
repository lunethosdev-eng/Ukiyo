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
import { useAuth } from "@/context/AuthContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    await register(name.trim(), email.trim(), password);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Crear cuenta</Text>
      <LiquidGlass borderRadius={12} style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={name}
          onChangeText={setName}
        />
      </LiquidGlass>
      <LiquidGlass borderRadius={12} style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </LiquidGlass>
      <LiquidGlass borderRadius={12} style={styles.field}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </LiquidGlass>
      <Pressable style={styles.btn} onPress={onSubmit}>
        <Text style={styles.btnText}>Registrarse</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  field: { marginBottom: 12 },
  input: { height: 48, paddingHorizontal: 16, color: "#fff", fontSize: 16 },
  btn: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#000", fontWeight: "700", fontSize: 16 },
});
