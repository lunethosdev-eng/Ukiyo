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
import { useCatalog } from "@/context/CatalogContext";
import { usePlayback } from "@/context/PlaybackContext";

export default function LibraryScreen() {
  const { tracks } = useCatalog();
  const { play, downloadedTracks } = usePlayback();

  const data = downloadedTracks.length ? downloadedTracks : tracks;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Biblioteca</Text>
      <Text style={styles.sub}>
        {downloadedTracks.length
          ? `${downloadedTracks.length} descargadas`
          : `${tracks.length} en catálogo`}
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => play(item)}>
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
  sub: {
    color: "rgba(255,255,255,0.45)",
    marginLeft: 20,
    marginBottom: 12,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  art: { width: 48, height: 48, borderRadius: 6, backgroundColor: "#1c1c1e" },
  title: { color: "#fff", fontSize: 16, fontWeight: "500" },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
});
