import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  loadRemoteConfig,
  setConfigKey,
  fetchAnnouncements,
  createAnnouncement,
  deactivateAnnouncement,
  broadcastPush,
  Announcement,
  RuntimeConfig,
} from "@/services/remoteConfig";

const ADMIN_SESSION_KEY = "@ukiyo/admin_ok";

export default function AdminScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Config
  const [serverUrl, setServerUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  // Announcements
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [list, setList] = useState<Announcement[]>([]);
  const [publishing, setPublishing] = useState(false);

  const refresh = useCallback(async () => {
    const map = await loadRemoteConfig();
    setServerUrl(map.seki_api_url || RuntimeConfig.SEKI_API_URL);
    setApiKey(map.seki_api_key || RuntimeConfig.SEKI_API_KEY);
    const anns = await fetchAnnouncements();
    setList(anns);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const tryUnlock = () => {
    if (pin.trim() === RuntimeConfig.ADMIN_PIN) {
      setUnlocked(true);
    } else {
      Alert.alert("PIN incorrecto", "Revisa el PIN de administrador.");
    }
  };

  const saveServer = async () => {
    if (!serverUrl.trim()) {
      Alert.alert("URL vacía");
      return;
    }
    setSavingConfig(true);
    const ok1 = await setConfigKey("seki_api_url", serverUrl.trim().replace(/\/$/, ""));
    const ok2 = apiKey.trim()
      ? await setConfigKey("seki_api_key", apiKey.trim())
      : true;
    setSavingConfig(false);
    if (ok1 && ok2) {
      Alert.alert(
        "Guardado",
        "La URL del servidor se actualizó globalmente. Todos los usuarios la usarán al abrir o refrescar la app."
      );
    } else {
      Alert.alert(
        "Error",
        "No se pudo guardar. Verifica que exista la tabla app_config en Supabase y las políticas RLS permitan escritura con la anon key."
      );
    }
  };

  const publish = async () => {
    if (!title.trim()) {
      Alert.alert("Falta el título");
      return;
    }
    setPublishing(true);
    const ann = await createAnnouncement({
      title: title.trim(),
      body: body.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
    });
    if (!ann) {
      setPublishing(false);
      Alert.alert(
        "Error",
        "No se pudo crear el anuncio. Crea la tabla announcements en Supabase."
      );
      return;
    }
    // Push a todos
    const { sent } = await broadcastPush(ann.title, ann.body || "Nuevo anuncio en Ukiyo", {
      type: "announcement",
      id: ann.id,
    });
    setPublishing(false);
    setTitle("");
    setBody("");
    setImageUrl("");
    await refresh();
    Alert.alert(
      "Publicado",
      `Anuncio creado. Notificaciones enviadas: ${sent}.\n(Los usuarios con la app cerrada las reciben si tienen token Expo registrado.)`
    );
  };

  const remove = (id: string) => {
    Alert.alert("Desactivar anuncio", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desactivar",
        style: "destructive",
        onPress: async () => {
          await deactivateAnnouncement(id);
          await refresh();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" />
      </View>
    );
  }

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <View style={styles.lockBox}>
          <Ionicons name="shield-checkmark" size={48} color="#a78bfa" />
          <Text style={styles.lockTitle}>Panel Admin</Text>
          <Text style={styles.lockHint}>Introduce el PIN de administrador</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="PIN"
            placeholderTextColor="rgba(255,255,255,0.35)"
            secureTextEntry
            keyboardType="default"
            onSubmitEditing={tryUnlock}
          />
          <Pressable style={styles.btn} onPress={tryUnlock}>
            <Text style={styles.btnText}>Entrar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Admin Ukiyo</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* SERVER URL */}
          <Text style={styles.section}>Servidor de música (global)</Text>
          <Text style={styles.help}>
            Cambia la URL del tunnel/API. Todos los usuarios la reciben al abrir la app. No hace falta
            recompilar.
          </Text>
          <Text style={styles.label}>SEKI API URL</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://xxxx.loca.lt"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            placeholder="kokoro-seki-2026"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
          <Pressable
            style={[styles.btn, savingConfig && { opacity: 0.6 }]}
            onPress={saveServer}
            disabled={savingConfig}
          >
            {savingConfig ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Guardar URL global</Text>
            )}
          </Pressable>

          {/* ANNOUNCEMENTS */}
          <Text style={[styles.section, { marginTop: 28 }]}>Anuncios</Text>
          <Text style={styles.help}>
            Se muestran en la app y se envía notificación push a quienes tengan la app instalada
            (aunque esté cerrada, si el token está registrado).
          </Text>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Mantenimiento, nueva función…"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
          <Text style={styles.label}>Mensaje</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            value={body}
            onChangeText={setBody}
            multiline
            placeholder="Detalle del anuncio"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
          <Text style={styles.label}>URL de imagen (opcional)</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
            placeholder="https://…/foto.jpg"
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
          {!!imageUrl.trim() && (
            <Image source={{ uri: imageUrl.trim() }} style={styles.preview} resizeMode="cover" />
          )}
          <Pressable
            style={[styles.btn, styles.btnAccent, publishing && { opacity: 0.6 }]}
            onPress={publish}
            disabled={publishing}
          >
            {publishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Publicar + notificar</Text>
            )}
          </Pressable>

          <Text style={[styles.section, { marginTop: 28 }]}>Anuncios activos</Text>
          {list.length === 0 && (
            <Text style={styles.help}>Ningún anuncio activo.</Text>
          )}
          {list.map((a) => (
            <View key={a.id} style={styles.card}>
              {!!a.image_url && (
                <Image source={{ uri: a.image_url }} style={styles.cardImg} />
              )}
              <Text style={styles.cardTitle}>{a.title}</Text>
              {!!a.body && <Text style={styles.cardBody}>{a.body}</Text>}
              <Text style={styles.cardDate}>
                {new Date(a.created_at).toLocaleString()}
              </Text>
              <Pressable onPress={() => remove(a.id)} style={styles.danger}>
                <Text style={styles.dangerText}>Desactivar</Text>
              </Pressable>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  back: { position: "absolute", top: 54, left: 16, zIndex: 2 },
  lockBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  lockTitle: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 16 },
  lockHint: { color: "rgba(255,255,255,0.5)", marginTop: 8, marginBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { color: "#c4b5fd", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  help: { color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 18, marginBottom: 12 },
  label: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: "#6d28d9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnAccent: { backgroundColor: "#7c3aed" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  preview: { width: "100%", height: 160, borderRadius: 12, marginTop: 8 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardImg: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cardBody: { color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: 14 },
  cardDate: { color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 8 },
  danger: { marginTop: 10, alignSelf: "flex-start" },
  dangerText: { color: "#f87171", fontWeight: "600" },
});
