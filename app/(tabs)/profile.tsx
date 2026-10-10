import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const settingsContext = useSettings();
  const settings = settingsContext?.settings;

  const letter = (user?.displayName || user?.email || "G").charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerFallback} />
        </View>

        <View style={styles.avatarRow}>
          <View style={[styles.avatar, styles.avatarPh]}>
            <Text style={styles.avatarLetter}>{letter}</Text>
          </View>
          <View style={{ flex: 1, paddingBottom: 8 }}>
            <Text style={styles.name}>{user?.displayName || "Invitado"}</Text>
            <Text style={styles.nick}>@{user?.username || "guest"}</Text>
            {user?.isGuest && <Text style={styles.guestBadge}>Modo invitado</Text>}
          </View>
        </View>

        <LiquidGlass borderRadius={16} intensity={40} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Perfil público</Text>
            <Switch
              value={!!settings?.publicProfile}
              onValueChange={(v) => settingsContext?.set({ publicProfile: v })}
              trackColor={{ false: "#333", true: "#a78bfa" }}
              thumbColor="#fff"
            />
          </View>
        </LiquidGlass>

        <LiquidGlass borderRadius={16} intensity={40} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Mostrar actividad</Text>
            <Switch
              value={!!settings?.showListeningActivity}
              onValueChange={(v) => settingsContext?.set({ showListeningActivity: v })}
              trackColor={{ false: "#333", true: "#a78bfa" }}
              thumbColor="#fff"
            />
          </View>
        </LiquidGlass>

        <Pressable style={styles.linkCard} onPress={() => router.push("/settings")}>
          <Text style={styles.linkText}>Personalización y privacidad</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>

        <Pressable
          style={styles.logout}
          onPress={async () => {
            await logout();
            router.replace("/(auth)/welcome");
          }}
        >
          <Text style={styles.logoutText}>
            {user?.isGuest ? "Salir del modo invitado" : "Cerrar sesión"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: { height: 100, backgroundColor: "#1c1c1e", overflow: "hidden" },
  bannerFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: "#1a1228" },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: -32,
    gap: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#1c1c1e",
  },
  avatarPh: { alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#fff", fontSize: 28, fontWeight: "600" },
  name: { color: "#fff", fontSize: 20, fontWeight: "700" },
  nick: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  guestBadge: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 },
  card: { marginHorizontal: 16, marginTop: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLabel: { color: "#fff", fontSize: 16, fontWeight: "500" },
  linkCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  linkText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  chev: { color: "rgba(255,255,255,0.4)", fontSize: 22 },
  logout: { marginTop: 28, alignItems: "center", marginBottom: 20 },
  logoutText: { color: "#ff453a", fontSize: 16, fontWeight: "500" },
});
