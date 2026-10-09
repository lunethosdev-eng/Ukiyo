import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function ProfileScreen() {
  const { user, logout, pickProfilePhoto } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Cuenta</Text>

      <View style={styles.center}>
        <Pressable onPress={pickProfilePhoto}>
          {user?.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>
                {(user?.name || "U")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.changePhoto}>Cambiar foto</Text>
        </Pressable>
        <Text style={styles.name}>{user?.name || "Usuario"}</Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
      </View>

      <LiquidGlass borderRadius={14} style={styles.card}>
        <Text style={styles.rowLabel}>Plan</Text>
        <Text style={styles.rowValue}>Ukiyo</Text>
      </LiquidGlass>

      <Pressable
        style={styles.logout}
        onPress={async () => {
          await logout();
          router.replace("/(auth)/welcome");
        }}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 8,
  },
  center: { alignItems: "center", marginVertical: 28 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1c1c1e",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 36, fontWeight: "600" },
  changePhoto: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "600", marginTop: 12 },
  email: { color: "rgba(255,255,255,0.45)", marginTop: 4 },
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { color: "rgba(255,255,255,0.55)", fontSize: 15 },
  rowValue: { color: "#fff", fontWeight: "600" },
  logout: { marginTop: 32, alignItems: "center" },
  logoutText: { color: "#ff453a", fontSize: 16, fontWeight: "500" },
});
