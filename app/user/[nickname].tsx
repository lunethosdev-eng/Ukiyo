import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
  Share,
  FlatList,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { usePlayback } from "@/context/PlaybackContext";
import {
  getProfile,
  recordVisit,
  follow,
  listFavorites,
  PublicProfile,
  FavTrack,
} from "@/services/socialService";
import { sendMessageRequest, startDm } from "@/services/chatService";

export default function UserProfileScreen() {
  const { nickname } = useLocalSearchParams<{ nickname: string }>();
  const { user } = useAuth();
  const { play } = usePlayback();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [favs, setFavs] = useState<FavTrack[]>([]);

  useEffect(() => {
    if (!nickname) return;
    (async () => {
      const p = await getProfile(nickname);
      setProfile(p);
      setFavs(await listFavorites(nickname));
      if (p) recordVisit(nickname);
    })();
  }, [nickname]);

  const onMessage = async () => {
    if (!user?.nickname || user.isGuest) {
      Alert.alert("Inicia sesión");
      return;
    }
    // if not following, send request
    const ok = await sendMessageRequest(
      user.nickname,
      nickname!,
      `Hola @${nickname}, ¿podemos chatear?`
    );
    if (ok) Alert.alert("Solicitud enviada");
    else {
      const id = await startDm(user.nickname, nickname!);
      if (id) router.push(`/chat/${id}`);
    }
  };

  if (!profile) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ title: nickname || "Perfil", headerStyle: { backgroundColor: "#000" }, headerTintColor: "#fff" }} />
        <Text style={styles.empty}>Perfil no encontrado o privado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 120 }}>
      <Stack.Screen
        options={{
          title: `@${profile.nickname}`,
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable
              onPress={() =>
                Share.share({
                  message: `Mira el perfil de @${profile.nickname} en Ukiyo`,
                })
              }
            >
              <Ionicons name="share-outline" size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.banner}>
        {profile.banner_uri ? (
          <Image source={{ uri: profile.banner_uri }} style={StyleSheet.absoluteFillObject} />
        ) : null}
      </View>
      <View style={styles.row}>
        {profile.photo_uri ? (
          <Image source={{ uri: profile.photo_uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.ph]}>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>
              {(profile.name || profile.nickname || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.name || profile.nickname}</Text>
          <Text style={styles.nick}>@{profile.nickname}</Text>
          {!!profile.badge && profile.badge !== "none" && (
            <Text style={styles.badge}>{profile.badge}</Text>
          )}
        </View>
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>{profile.followers_count ?? 0} seguidores</Text>
        <Text style={styles.stat}>{profile.visits_count ?? 0} visitas</Text>
      </View>
      {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

      <View style={styles.actions}>
        <Pressable
          style={styles.btn}
          onPress={() => user?.nickname && follow(user.nickname, profile.nickname)}
        >
          <Text style={styles.btnText}>Seguir</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnOut]} onPress={onMessage}>
          <Text style={styles.btnTextOut}>Mensaje</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Músicas favoritas</Text>
      {favs.length === 0 ? (
        <Text style={styles.empty}>Sin favoritas públicas</Text>
      ) : (
        favs.map((f) => (
          <Pressable
            key={f.id}
            style={styles.track}
            onPress={() =>
              f.url &&
              play({
                id: f.track_id,
                title: f.title || "",
                artist: f.artist || "",
                artwork: f.artwork || "",
                url: f.url,
              })
            }
          >
            {f.artwork ? (
              <Image source={{ uri: f.artwork }} style={styles.art} />
            ) : (
              <View style={[styles.art, styles.ph]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.tTitle}>{f.title}</Text>
              <Text style={styles.tArtist}>{f.artist}</Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  banner: { height: 120, backgroundColor: "#1a1228" },
  row: { flexDirection: "row", padding: 16, gap: 14, alignItems: "flex-end", marginTop: -36 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: "#000" },
  ph: { backgroundColor: "#1c1c1e", alignItems: "center", justifyContent: "center" },
  name: { color: "#fff", fontSize: 20, fontWeight: "700" },
  nick: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  badge: { color: "#a78bfa", fontSize: 12, marginTop: 4, textTransform: "capitalize" },
  stats: { flexDirection: "row", gap: 16, paddingHorizontal: 16 },
  stat: { color: "rgba(255,255,255,0.55)", fontSize: 13 },
  bio: { color: "rgba(255,255,255,0.7)", paddingHorizontal: 16, marginTop: 10 },
  actions: { flexDirection: "row", gap: 10, padding: 16 },
  btn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnOut: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  btnText: { color: "#000", fontWeight: "700" },
  btnTextOut: { color: "#fff", fontWeight: "700" },
  section: { color: "#fff", fontWeight: "700", fontSize: 18, paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  empty: { color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 20 },
  track: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 8, alignItems: "center" },
  art: { width: 48, height: 48, borderRadius: 8 },
  tTitle: { color: "#fff", fontWeight: "600" },
  tArtist: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
});
