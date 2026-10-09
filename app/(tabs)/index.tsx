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

function SongRow({
  item,
  onPress,
}: {
  item: Track;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Image source={{ uri: item.artwork }} style={styles.art} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { tracks, loading, error, refresh } = useCatalog();
  const { play } = usePlayback();

  const recent = useMemo(() => tracks.slice(0, 20), [tracks]);
  const byGenre = useMemo(() => {
    const map: Record<string, Track[]> = {};
    tracks.forEach((t) => {
      const g = t.genre || "Otros";
      if (!map[g]) map[g] = [];
      if (map[g].length < 12) map[g].push(t);
    });
    return Object.entries(map).slice(0, 6);
  }, [tracks]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Escuchar ahora</Text>
      </View>

      {loading && !tracks.length ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
      ) : error && !tracks.length ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#fff"
            />
          }
          ListHeaderComponent={
            <>
              <Text style={styles.section}>Recién agregadas</Text>
              <FlatList
                horizontal
                data={tracks.slice(0, 15)}
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
              {byGenre.map(([genre, list]) => (
                <View key={genre}>
                  <Text style={styles.section}>{genre}</Text>
                </View>
              ))}
              <Text style={styles.section}>Todas las canciones</Text>
            </>
          }
          contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <SongRow item={item} onPress={() => play(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  greeting: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  section: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
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
  meta: { flex: 1 },
  title: { color: "#fff", fontSize: 16, fontWeight: "500" },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  card: { width: 140 },
  cardArt: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: "#1c1c1e",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  cardArtist: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 },
  error: { color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 40 },
});
