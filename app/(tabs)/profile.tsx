import React from "react";
import { View, Text, StyleSheet, Image, Pressable, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const settingsContext = useSettings();
  const router = useRouter();

  const isPublic = settingsContext?.settings?.publicProfile ?? true;
  const showActivity = settingsContext?.settings?.showListeningActivity ?? true;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.banner}>
          {user?.bannerUri ? (
            <Image source={{ uri: user.bannerUri }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.bannerFallback} />
          )}
          <View style={styles.bannerOverlay} />
        </View>

        <View style={styles.avatarRow}>
          {user?.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Text style={styles.avatarLetter}>
                {(user?.nickname || user?.name || "U")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || "Usuario"}</Text>
            <Text style={styles.nick}>@{user?.nickname || "guest"}</Text>
            {user?.isGuest && <Text style={styles.guestBadge}>Modo invitado</Text>}
          </View>
        </View>

        {!!user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <LiquidGlass borderRadius={14} intensity={40} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Perfil público</Text>
            <Switch
              value={isPublic}
              onValueChange={(v) => {
                settingsContext?.set({ publicProfile: v });
                updateProfile({ isPublic: v });
              }}
              trackColor={{ false: "#333", true: "#fff" }}
              thumbColor="#000"
            />
          </View>
        </LiquidGlass>

        <LiquidGlass borderRadius={14} intensity={40} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Mostrar actividad</Text>
            <Switch
              value={showActivity}
              onValueChange={(v) => settingsContext?.set({ showListeningActivity: v })}
              trackColor={{ false: "#333", true: "#fff" }}
              thumbColor="#000"
            />
          </View>
        </LiquidGlass>

        <Pressable style={styles.linkCard} onPress={() => router.push("/settings")}>
          <Text style={styles.linkText}>Personalización y privacidad</Text>
          <Text style={styles.chev}>›</Text>
        </Pressable>

        <Pressable style={styles.logout} onPress={async () => {
          await logout();
          router.replace("/(auth)/welcome");
        }}>
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
  banner: { height: 140, backgroundColor: "#1c1c1e", overflow: "hidden" },
  bannerFallback: { ...StyleSheet.absoluteFillObject, backgroundColor: "#1a1a1c" },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  avatarRow: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, marginTop: -36, gap: 14 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: "#000", backgroundColor: "#1c1c1e" },
  avatarPh: { alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#fff", fontSize: 32, fontWeight: "600" },
  name: { color: "#fff", fontSize: 22, fontWeight: "700" },
  nick: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 2 },
  guestBadge: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 },
  bio: { color: "rgba(255,255,255,0.65)", paddingHorizontal: 20, marginTop: 12, fontSize: 14 },
  card: { marginHorizontal: 16, marginTop: 16, paddingHorizontal: 16, paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  rowLabel: { color: "#fff", fontSize: 16 },
  linkCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: "#1c1c1e", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  chev: { color: "rgba(255,255,255,0.4)", fontSize: 22 },
  logout: { marginTop: 28, alignItems: "center" },
  logoutText: { color: "#ff453a", fontSize: 16, fontWeight: "500" },
});
