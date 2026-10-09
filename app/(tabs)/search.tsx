import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
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
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const { tracks } = useCatalog();
  const { play } = usePlayback();

  const local = useMemo(
    () => SongsService.searchLocal(query, tracks),
    [query, tracks]
  );

  const onSearch = async () => {
    const q = query.trim();
    if (q.length < 2 || searching) return;

    setSearching(true);
    setStatusMsg("Procesando en el servidor, por favor espera...");
    setRemote([]);

    try {
      // 1) Resultados locales inmediatos ya están en `local`
      // 2) Seki: puede tardar 1–3 min si descarga de YouTube
      const data: any = await SekiApiService.search(q);
      const results = Array.isArray(data)
        ? data
        : data?.results ?? [];

      const mapped: Track[] = results.map((r: any) => ({
        id: String(r.id ?? r.youtube_id ?? Math.random()),
        title: r.title || r.name || "Unknown",
        artist: r.artist || "Unknown",
        album: r.album,
        artwork: r.cover_url || r.artwork || "",
        url: r.audio_url || r.url || "",
        duration: r.duration_seconds,
        lyricsText: r.lyrics_text,
        genre: r.genre,
      }));

      setRemote(mapped.filter((t) => t.url));
      setStatusMsg(
        data?.source === "downloaded_on_demand"
          ? "Nueva pista procesada en el servidor"
          : null
      );
    } catch (e: any) {
      setStatusMsg(e?.message || "Error de búsqueda");
    } finally {
      setSearching(false);
    }
  };

  // Mostrar local primero; si hay remote, combinar sin duplicar por id
  const data = useMemo(() => {
    const map = new Map<string, Track>();
    [...local, ...remote].forEach((t) => {
      if (t.id && !map.has(t.id)) map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [local, remote]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Buscar</Text>

      <View style={styles.searchRow}>
        <LiquidGlass borderRadius={12} style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Artistas, canciones..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            editable={!searching}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </LiquidGlass>
        <Pressable
          style={[styles.searchBtn, searching && { opacity: 0.4 }]}
          onPress={onSearch}
          disabled={searching}
        >
          <Text style={styles.searchBtnText}>Ir</Text>
        </Pressable>
      </View>

      {searching && (
        <View style={styles.loaderBox}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loaderText}>
            Procesando en el servidor, por favor espera...
          </Text>
          <Text style={styles.loaderHint}>
            Si la canción no está en caché, puede tardar 1–3 minutos
          </Text>
        </View>
      )}

      {!!statusMsg && !searching && (
        <Text style={styles.status}>{statusMsg}</Text>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        ListEmptyComponent={
          !searching ? (
            <Text style={styles.empty}>
              {query.length > 1
                ? "Sin resultados"
                : `${tracks.length} canciones en catálogo`}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => item.url && play(item)}
          >
            <Image
              source={{ uri: item.artwork || undefined }}
              style={styles.art}
            />
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  searchBox: { flex: 1 },
  input: {
    height: 44,
    paddingHorizontal: 14,
    color: "#fff",
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 18,
    height: 44,
    justifyContent: "center",
  },
  searchBtnText: { color: "#000", fontWeight: "700" },
  loaderBox: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 10,
  },
  loaderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  loaderHint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    textAlign: "center",
  },
  status: {
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginBottom: 8,
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
  empty: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 40,
  },
});
