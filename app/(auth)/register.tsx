import React, { useState } from "react";
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

  const onSubmit = async () => {
    if (!name.trim() || !nickname.trim() || !email.trim() || password.length < 4) {
      Alert.alert("Completa todos los campos", "Nickname y nombre son obligatorios.");
      return;
    }
    setBusy(true);
    try {
      await register({ name, nickname, email, password });
      router.replace("/(tabs)");
    } finally {
      setBusy(false);
    }
  };

  const Field = ({
    label,
    ...props
  }: { label: string } & React.ComponentProps<typeof TextInput>) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <LiquidGlass borderRadius={12} intensity={36}>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.28)"
          autoCapitalize="none"
          {...props}
        />
      </LiquidGlass>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Text entering={FadeInDown} style={styles.title}>
          Crear cuenta
        </Animated.Text>
        <Text style={styles.hint}>
          Elige un nickname único. Puedes cambiar el banner y la privacidad después.
        </Text>

        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" autoCapitalize="words" />
        <Field
          label="Nickname"
          value={nickname}
          onChangeText={(t) => setNickname(t.replace(/\s/g, "").toLowerCase())}
          placeholder="ukiyo_user"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          keyboardType="email-address"
        />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Pressable
          style={[styles.btn, busy && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={busy}
        >
          <Text style={styles.btnText}>Crear cuenta</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Volver</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0c0c0e" },
  scroll: { padding: 24, paddingTop: 72, paddingBottom: 40 },
  title: {
    color: "#f5f5f7",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  hint: {
    color: "rgba(245,245,247,0.45)",
    marginTop: 8,
    marginBottom: 28,
    fontSize: 15,
    lineHeight: 21,
  },
  fieldWrap: { marginBottom: 14 },
  label: {
    color: "rgba(245,245,247,0.55)",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
  },
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
    marginTop: 12,
  },
  btnText: { color: "#0c0c0e", fontWeight: "700", fontSize: 16 },
  back: {
    color: "rgba(245,245,247,0.45)",
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
});
