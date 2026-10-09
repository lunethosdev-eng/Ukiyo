// app/(tabs)/library.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidGlassCard } from "@/components/liquid/LiquidGlassCard";
import { usePlayback } from "@/context/PlaybackContext";

export default function LibraryScreen() {
  const { downloadedTracks, play, isOffline } = usePlayback();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Biblioteca</Text>
      <Text style={styles.subtitle}>
        {isOffline
          ? "Música descargada (modo offline)"
          : "Tus descargas y favoritos"}
      </Text>

      <FlatList
        data={downloadedTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aún no has descargado música.{"\n"}
            Busca canciones y descárgalas para escuchar offline.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => play(item)}>
            <LiquidGlassCard style={styles.row}>
              <Image source={{ uri: item.artwork }} style={styles.art} />
              <View style={{ flex: 1 }}>
                <Text style={styles.song} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
              {item.localUri && (
                <Text style={styles.badge}>↓</Text>
              )}
            </LiquidGlassCard>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0618" },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginLeft: 20,
    marginTop: 12,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    marginLeft: 20,
    marginBottom: 16,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
    padding: 10,
  },
  art: { width: 54, height: 54, borderRadius: 10 },
  song: { color: "#fff", fontWeight: "600", fontSize: 15 },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  badge: { color: "#A855F7", fontSize: 18, fontWeight: "700" },
  empty: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 60,
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});
