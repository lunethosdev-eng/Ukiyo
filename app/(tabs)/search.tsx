import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
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
import { SongsService, Track } from "@/services/songsService";
import { SekiApiService } from "@/services/sekiApi";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { searchProfiles, PublicProfile } from "@/services/socialService";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [remote, setRemote] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { tracks } = useCatalog();
  const { play } = usePlayback();
  const router = useRouter();
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const reqId = useRef(0);
  const inputRef = useRef<TextInput>(null);

  const local = useMemo(
    () => SongsService.searchLocal(query, tracks),
    [query, tracks]
  );

  const onSearch = useCallback(async (qRaw?: string) => {
    const q = (qRaw ?? query).trim();
    if (q.length < 2) {
      setRemote([]);
      return;
    }
    const id = ++reqId.current;
    setSearching(true);
    setError(null);
    try {
      const data: any = await SekiApiService.search(q);
      if (id !== reqId.current) return;
      const results = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.songs)
            ? data.songs
            : Array.isArray(data?.tracks)
              ? data.tracks
              : Array.isArray(data?.data)
                ? data.data
                : [];
      const mapped: Track[] = results
        .map((r: any, i: number) => ({
          id: String(r?.id ?? r?.youtube_id ?? `r-${i}`),
          title: String(r?.title || r?.name || "Sin título"),
          artist: String(r?.artist || "Desconocido"),
          album: r?.album,
          artwork: String(r?.cover_url || r?.artwork || ""),
          url: String(
            r?.audio_url || r?.stream_url || r?.download_url || r?.url || ""
          ),
          duration: r?.duration_seconds,
          lyricsText: r?.lyrics_text,
          genre: r?.genre,
        }))
        .filter((t: Track) => !!t.url);
      setRemote(mapped);
    } catch (e: any) {
      if (id !== reqId.current) return;
      setError(
        e?.message?.includes("timeout")
          ? "El servidor tardó demasiado."
          : "Error de red o URL del servidor inválida."
      );
      setRemote([]);
    } finally {
      if (id === reqId.current) setSearching(false);
    }
  }, [query]);

  // debounce remoto
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRemote([]);
      setProfiles([]);
      return;
    }
    const t = setTimeout(() => {
      onSearch(q);
      searchProfiles(q).then(setProfiles);
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  const data = useMemo(() => {
    const map = new Map<string, Track>();
    [...(Array.isArray(local) ? local : []), ...(Array.isArray(remote) ? remote : [])].forEach(
      (t) => {
        if (t?.id && !map.has(t.id)) map.set(t.id, t);
      }
    );
    return Array.from(map.values());
  }, [local, remote]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Buscar</Text>

      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" style={{ marginLeft: 14 }} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Artistas, canciones..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setError(null);
            }}
            onSubmitEditing={() => onSearch()}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            editable={true}
            showSoftInputOnFocus={true}
          />
          {!!query && (
            <Pressable onPress={() => setQuery("")} hitSlop={10} style={{ padding: 10 }}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.go} onPress={() => onSearch()}>
          <Text style={styles.goText}>Ir</Text>
        </Pressable>
      </View>

      {searching && (
        <View style={styles.loader}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loaderText}>Buscando…</Text>
        </View>
      )}
      {!!error && !searching && <Text style={styles.error}>{error}</Text>}

      {profiles.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 }}>Personas</Text>
          {profiles.map((p) => (
            <Pressable
              key={p.nickname}
              style={styles.row}
              onPress={() => router.push(`/user/${p.nickname}`)}
            >
              {p.photo_uri ? (
                <Image source={{ uri: p.photo_uri }} style={styles.art} />
              ) : (
                <View style={[styles.art, styles.artPh, { alignItems: "center", justifyContent: "center" }]}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{p.name || p.nickname}</Text>
                <Text style={styles.artist}>@{p.nickname}</Text>
              </View>
            </Pressable>
          ))}
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 12, marginBottom: 4 }}>Canciones</Text>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        ListEmptyComponent={
          !searching && profiles.length === 0 ? (
            <Text style={styles.empty}>
              {query.length > 1 ? "Sin resultados" : "Busca canciones o personas"}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => item.url && play(item, data)}
          >
            {item.artwork ? (
              <Image source={{ uri: item.artwork }} style={styles.art} />
            ) : (
              <View style={[styles.art, styles.artPh]} />
            )}
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
    letterSpacing: -0.4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
    color: "#fff",
    fontSize: 16,
  },
  go: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 18,
    height: 48,
    justifyContent: "center",
  },
  goText: { color: "#000", fontWeight: "700" },
  loader: { alignItems: "center", padding: 24, gap: 10 },
  loaderText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  error: {
    color: "#ff6b6b",
    textAlign: "center",
    marginHorizontal: 24,
    marginBottom: 8,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  art: { width: 52, height: 52, borderRadius: 8, backgroundColor: "#1c1c1e" },
  artPh: { backgroundColor: "#1c1c1e" },
  title: { color: "#fff", fontSize: 16, fontWeight: "500" },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  empty: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 40,
  },
});
