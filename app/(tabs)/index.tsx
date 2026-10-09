import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCatalog } from "@/context/CatalogContext";
import { usePlayback } from "@/context/PlaybackContext";
import { Track } from "@/services/songsService";

export default function HomeScreen() {
  const { tracks, loading, error, refresh } = useCatalog();
  const { play } = usePlayback();
  const recent = useMemo(() => tracks.slice(0, 40), [tracks]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.greeting}>Escuchar ahora</Text>

      {loading && !tracks.length ? (
        <ActivityIndicator color="#f5f5f7" style={{ marginTop: 40 }} />
      ) : error && !tracks.length ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#f5f5f7" />
          }
          ListHeaderComponent={
            <>
              <Text style={styles.section}>Recién agregadas</Text>
              <FlatList
                horizontal
                data={tracks.slice(0, 12)}
                keyExtractor={(i) => `h-${i.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                renderItem={({ item }) => (
                  <Pressable onPress={() => play(item)} style={styles.card}>
                    <Image source={{ uri: item.artwork }} style={styles.cardArt} />
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </Pressable>
                )}
              />
              <Text style={styles.section}>Todas</Text>
            </>
          }
          contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 16 }}
          renderItem={({ item }: { item: Track }) => (
            <Pressable onPress={() => play(item)} style={styles.row}>
              <Image source={{ uri: item.artwork }} style={styles.art} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0c0e" },
  greeting: {
    color: "#f5f5f7",
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 20,
    marginTop: 8,
    letterSpacing: -0.4,
  },
  section: {
    color: "#f5f5f7",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 12,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  art: { width: 48, height: 48, borderRadius: 6, backgroundColor: "#1c1c1e" },
  title: { color: "#f5f5f7", fontSize: 16, fontWeight: "500" },
  artist: { color: "rgba(245,245,247,0.45)", fontSize: 13, marginTop: 2 },
  card: { width: 140 },
  cardArt: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: "#1c1c1e",
  },
  cardTitle: { color: "#f5f5f7", fontSize: 13, fontWeight: "600", marginTop: 8 },
  cardArtist: { color: "rgba(245,245,247,0.45)", fontSize: 12, marginTop: 2 },
  error: { color: "rgba(245,245,247,0.5)", textAlign: "center", marginTop: 40 },
});
