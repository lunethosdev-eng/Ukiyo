// app/(tabs)/search.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassInput } from "@/components/ui/GlassInput";
import { LiquidGlassCard } from "@/components/liquid/LiquidGlassCard";
import { SekiApiService } from "@/services/sekiApi";
import { usePlayback } from "@/context/PlaybackContext";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { play, isOffline } = usePlayback();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2 || isOffline) return;

    setLoading(true);
    try {
      const data = await SekiApiService.search(text);
      setResults(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e) {
      console.warn("Search error", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Buscar</Text>
      <View style={styles.inputWrap}>
        <GlassInput
          placeholder="Canciones, artistas, álbumes..."
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {loading && (
        <ActivityIndicator color="#A855F7" style={{ marginTop: 40 }} />
      )}

      <FlatList
        data={results}
        keyExtractor={(item, i) => item.id ?? String(i)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              play({
                id: item.id,
                title: item.title || item.name,
                artist: item.artist || item.artists?.[0]?.name || "Unknown",
                artwork: item.artwork || item.album?.images?.[0]?.url || "",
                url: item.url || item.preview_url || "",
              })
            }
          >
            <LiquidGlassCard style={styles.row}>
              <Image
                source={{
                  uri:
                    item.artwork ||
                    item.album?.images?.[0]?.url ||
                    "https://via.placeholder.com/60",
                }}
                style={styles.art}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.song} numberOfLines={1}>
                  {item.title || item.name}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {item.artist || item.artists?.[0]?.name}
                </Text>
              </View>
            </LiquidGlassCard>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading && query.length > 1 ? (
            <Text style={styles.empty}>
              {isOffline ? "Modo offline – solo biblioteca local" : "Sin resultados"}
            </Text>
          ) : null
        }
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
  inputWrap: { paddingHorizontal: 16, marginTop: 12 },
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
  empty: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 40,
  },
});
