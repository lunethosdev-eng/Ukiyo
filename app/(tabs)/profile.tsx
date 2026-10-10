import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Switch,
  TextInput,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, BadgeLevel } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

const BADGE_META: Record<
  BadgeLevel,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  none: { label: "", color: "#888", icon: "ellipse" },
  artist: { label: "Artista", color: "#c4b5fd", icon: "musical-notes" },
  verified: { label: "Verificado", color: "#60a5fa", icon: "checkmark-circle" },
  exclusive: { label: "Exclusivo", color: "#fbbf24", icon: "diamond" },
  admin: { label: "Admin", color: "#f472b6", icon: "shield" },
  owner: { label: "Owner", color: "#f59e0b", icon: "ribbon" },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, applyAsArtist } = useAuth();
  const settingsContext = useSettings();
  const settings = settingsContext?.settings;
  const [editOpen, setEditOpen] = useState(false);
  const [artistOpen, setArtistOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUri || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUri || "");
  const [nick, setNick] = useState(user?.nickname || "");
  const [lastName, setLastName] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [reportType, setReportType] = useState("bug");

  const displayName = user?.isGuest ? "Invitado" : user?.name || "Usuario";
  const letter = displayName.charAt(0).toUpperCase();
  const badge = user?.badge && user.badge !== "none" ? BADGE_META[user.badge] : null;

  const saveEdit = async () => {
    await updateProfile({
      bio: bio.trim(),
      bannerUri: bannerUrl.trim() || null,
      photoUri: photoUrl.trim() || null,
      nickname: nick.trim().replace(/\s/g, "").toLowerCase() || user?.nickname,
    });
    setEditOpen(false);
  };

  const sendReport = async () => {
    const subject = encodeURIComponent(`[Ukiyo Report] ${reportType}`);
    const body = encodeURIComponent(
      `Tipo: ${reportType}\nUsuario: ${user?.nickname || "guest"}\nEmail: ${user?.email || "-"}\n\n${reportMsg}`
    );
    const url = `mailto:lunethos.dev@gmail.com?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
      setReportOpen(false);
      setReportMsg("");
    } catch {
      Alert.alert("No se pudo abrir el correo", "Escríbenos a lunethos.dev@gmail.com");
    }
  };

  const onArtist = async () => {
    if (!lastName.trim()) {
      Alert.alert("Falta el apellido");
      return;
    }
    await applyAsArtist(lastName.trim());
    setArtistOpen(false);
    Alert.alert("¡Bienvenido artista!", "Tu emblema de artista ya está activo. Sube de nivel con seguidores.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          {user?.bannerUri ? (
            <Image source={{ uri: user.bannerUri }} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#1a1228" }]} />
          )}
          <Pressable style={styles.editBtn} onPress={() => setEditOpen(true)}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.avatarRow}>
          {user?.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Text style={styles.avatarLetter}>{letter}</Text>
            </View>
          )}
          <View style={{ flex: 1, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.name}>{displayName}</Text>
              {badge && (
                <View style={[styles.badge, { borderColor: badge.color }]}>
                  <Ionicons name={badge.icon} size={12} color={badge.color} />
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.nick}>@{user?.nickname || "guest"}</Text>
            {user?.isGuest && <Text style={styles.guestBadge}>Modo invitado</Text>}
          </View>
        </View>

        {/* Stats */}
        {!user?.isGuest && (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statN}>{user?.followers ?? 0}</Text>
              <Text style={styles.statL}>Seguidores</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statN}>{user?.following ?? 0}</Text>
              <Text style={styles.statL}>Siguiendo</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statN}>{user?.likes ?? 0}</Text>
              <Text style={styles.statL}>Me gusta</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statN}>{user?.visits ?? 0}</Text>
              <Text style={styles.statL}>Visitas</Text>
            </View>
          </View>
        )}

        {!!user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <LiquidGlass borderRadius={16} intensity={40} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Perfil público</Text>
            <Switch
              value={user?.isPublic ?? !!settings?.publicProfile}
              onValueChange={(v) => {
                updateProfile({ isPublic: v });
                settingsContext?.set({ publicProfile: v });
              }}
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

        {!user?.isGuest && !user?.isArtist && (
          <Pressable style={styles.linkCard} onPress={() => setArtistOpen(true)}>
            <Text style={styles.linkText}>Programa de artistas</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        )}

        <Pressable style={styles.linkCard} onPress={() => setReportOpen(true)}>
          <Text style={styles.linkText}>Reportar un problema</Text>
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

      {/* Edit modal */}
      <Modal visible={editOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <Text style={styles.label}>Nickname</Text>
            <TextInput style={styles.input} value={nick} onChangeText={setNick} autoCapitalize="none" placeholderTextColor="#666" placeholder="nickname" />
            <Text style={styles.label}>Bio</Text>
            <TextInput style={styles.input} value={bio} onChangeText={setBio} placeholderTextColor="#666" placeholder="Sobre ti" />
            <Text style={styles.label}>URL foto</Text>
            <TextInput style={styles.input} value={photoUrl} onChangeText={setPhotoUrl} autoCapitalize="none" placeholderTextColor="#666" placeholder="https://..." />
            <Text style={styles.label}>URL banner</Text>
            <TextInput style={styles.input} value={bannerUrl} onChangeText={setBannerUrl} autoCapitalize="none" placeholderTextColor="#666" placeholder="https://..." />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#333" }]} onPress={() => setEditOpen(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#a78bfa" }]} onPress={saveEdit}>
                <Text style={[styles.modalBtnText, { color: "#000" }]}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Artist modal */}
      <Modal visible={artistOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Programa de artistas</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", marginBottom: 12, fontSize: 13 }}>
              Solo necesitamos tu apellido para el emblema. Niveles: Artista → Verificado (50+) → Exclusivo (1000+).
            </Text>
            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor="#666" placeholder="Apellido artístico" />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#333" }]} onPress={() => setArtistOpen(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#a78bfa" }]} onPress={onArtist}>
                <Text style={[styles.modalBtnText, { color: "#000" }]}>Inscribirme</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report modal */}
      <Modal visible={reportOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reportar problema</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {["bug", "crash", "contenido", "otro"].map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setReportType(t)}
                  style={[styles.chip, reportType === t && styles.chipOn]}
                >
                  <Text style={styles.chipText}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              value={reportMsg}
              onChangeText={setReportMsg}
              multiline
              placeholder="Describe el problema…"
              placeholderTextColor="#666"
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#333" }]} onPress={() => setReportOpen(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: "#a78bfa" }]} onPress={sendReport}>
                <Text style={[styles.modalBtnText, { color: "#000" }]}>Enviar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  banner: { height: 120, backgroundColor: "#1c1c1e", overflow: "hidden" },
  editBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRow: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 20, marginTop: -32, gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: "#000", backgroundColor: "#1c1c1e" },
  avatarPh: { alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#fff", fontSize: 28, fontWeight: "600" },
  name: { color: "#fff", fontSize: 20, fontWeight: "700" },
  nick: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  guestBadge: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
  stats: { flexDirection: "row", paddingHorizontal: 12, marginTop: 16, gap: 4 },
  stat: { flex: 1, alignItems: "center" },
  statN: { color: "#fff", fontWeight: "700", fontSize: 16 },
  statL: { color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 },
  bio: { color: "rgba(255,255,255,0.65)", paddingHorizontal: 20, marginTop: 12, fontSize: 14 },
  card: { marginHorizontal: 16, marginTop: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
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
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#121214", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  label: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff", paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "700" },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)" },
  chipOn: { backgroundColor: "rgba(167,139,250,0.35)" },
  chipText: { color: "#fff", fontSize: 13, textTransform: "capitalize" },
});
