import { Config } from "@/constants/Config";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  audio_url?: string | null;
  audio_path?: string | null;
  cover_url?: string | null;
  animated_cover_url?: string | null;
  lyrics_text?: string | null;
  lyrics?: unknown;
  genre?: string | null;
  release_year?: number | null;
  youtube_id?: string | null;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string;
  url: string;
  duration?: number;
  lyricsText?: string;
  genre?: string;
}

const PAGE = 1000;

function resolveAudioUrl(s: Song): string {
  if (s.audio_url) return s.audio_url;
  if (s.audio_path) {
    // path relativo en storage
    return `${Config.CATALOG_URL}/storage/v1/object/public/${Config.SUPABASE_BUCKET}/${s.audio_path}`;
  }
  return "";
}

function mapSong(s: Song): Track {
  const lyricsText =
    s.lyrics_text ??
    (Array.isArray(s.lyrics)
      ? (s.lyrics as { text?: string }[]).map((l) => l.text ?? "").join("\n")
      : undefined);
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album ?? undefined,
    artwork:
      s.cover_url ||
      `${Config.CATALOG_URL}/storage/v1/object/public/covers/placeholder.jpg`,
    url: resolveAudioUrl(s),
    duration: s.duration_seconds ?? undefined,
    lyricsText,
    genre: s.genre ?? undefined,
  };
}

export class SongsService {
  static async fetchAll(): Promise<Track[]> {
    const all: Song[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE - 1;
      const res = await fetch(
        `${Config.CATALOG_URL}/rest/v1/${Config.SONGS_TABLE}?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: Config.CATALOG_KEY,
            Authorization: `Bearer ${Config.CATALOG_KEY}`,
            Accept: "application/json",
            Range: `${from}-${to}`,
            Prefer: "count=exact",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Supabase tracks HTTP ${res.status}`);
      }

      const batch = (await res.json()) as Song[];
      if (!batch.length) break;
      all.push(...batch);
      if (batch.length < PAGE) break;
      from += PAGE;
    }

    return all.filter((s) => resolveAudioUrl(s)).map(mapSong);
  }

  static searchLocal(query: string, catalog: Track[]): Track[] {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album ?? "").toLowerCase().includes(q) ||
        (t.genre ?? "").toLowerCase().includes(q)
    );
  }
}
