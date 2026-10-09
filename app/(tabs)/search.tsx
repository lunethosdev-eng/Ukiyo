import React, { useState, useMemo, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Image, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCatalog } from "@/context/CatalogContext";
import { usePlayback } from "@/context/PlaybackContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { SongsService, Track } from "@/services/songsService";
import { SekiApiService } from "@/services/sekiApi";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [remote, setRemote] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { tracks } = useCatalog();
  const { play } = usePlayback();
  const reqId = useRef(0);

  const local = useMemo(() => SongsService.searchLocal(query, tracks), [query, tracks]);

  const onSearch = async () => {
    const q = query.trim();
    if (q.length < 2 || searching) return;
    const id = ++reqId.current;
    setSearching(true);
    setError(null);

    try {
      const data: any = await SekiApiService.search(q);
      if (id !== reqId.current) return;

      const results = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      const mapped: Track[] = results
        .map((r: any, i: number) => ({
          id: String(r?.id ?? r?.youtube_id ?? `r-${i}`),
          title: String(r?.title || r?.name || "Sin título"),
          artist: String(r?.artist || "Desconocido"),
          album: r?.album,
          artwork: String(r?.cover_url || r?.artwork || ""),
          url: String(r?.audio_url || r?.url || ""),
          duration: r?.duration_seconds,
          lyricsText: r?.lyrics_text,
          genre: r?.genre,
        }))
        .filter((t: Track) => !!t.url);

      setRemote(mapped);
    } catch (e: any) {
      if (id !== reqId.current) return;
      setError(e?.message?.includes("timeout") ? "El servidor tardó demasiado." : "Error de red.");
      setRemote([]);
    } finally {
      if (id === reqId.current) setSearching(false);
    }
  };

  const data = useMemo(() => {
    const map = new Map<string, Track>();
    [...local, ...remote].forEach((t) => {
      if (t?.id && !map.has(t.id)) map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [local, remote]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Buscar</Text>

      <View style={styles.searchRow}>
        <LiquidGlass borderRadius={14} intensity={40} style={{ flex: 1, height: 48 }}>
          <TextInput
            style={styles.input}
            placeholder="Artistas, canciones..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={(t) => { setQuery(t); setError(null); }}
            onSubmitEditing={onSearch}
            editable={!searching}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </LiquidGlass>
        <Pressable style={[styles.go, searching && { opacity: 0.4 }]} onPress={onSearch} disabled={searching}>
          <Text style={styles.goText}>Ir</Text>
        </Pressable>
      </View>

      {searching && (
        <View style={styles.loader}>
          <ActivityIndicator color="#f5f5f7" />
          <Text style={styles.loaderText}>Buscando...</Text>
        </View>
      )}

      {!!error && !searching && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        ListEmptyComponent={!searching ? <Text style={styles.empty}>{query.length > 1 ? "Sin resultados" : "Busca algo para empezar"}</Text> : null}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => item.url && play(item, data)}>
            {item.artwork ? <Image source={{ uri: item.artwork }} style={styles.art} /> : <View style={[styles.art, styles.artPh]} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  heading: { color: "#fff", fontSize: 28, fontWeight: "700", marginLeft: 20, marginTop: 8, letterSpacing: -0.4 },
  searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 12, marginBottom: 8, gap: 10 },
  input: { flex: 1, height: "100%", paddingHorizontal: 16, color: "#fff", fontSize: 16 },
  go: { backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 18, height: 48, justifyContent: "center" },
  goText: { color: "#000", fontWeight: "700" },
  loader: { alignItems: "center", padding: 24, gap: 10 },
  loaderText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  error: { color: "#ff6b6b", textAlign: "center", marginHorizontal: 24, marginBottom: 8, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  art: { width: 52, height: 52, borderRadius: 8, backgroundColor: "#1c1c1e" },
  artPh: { backgroundColor: "#1c1c1e" },
  title: { color: "#fff", fontSize: 16, fontWeight: "500" },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  empty: { color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 40 },
});
