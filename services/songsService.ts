// services/songsService.ts — Catálogo desde Supabase (tabla songs)
import { Config } from "@/constants/Config";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  audio_url: string;
  cover_url?: string | null;
  animated_cover_url?: string | null;
  lyrics_text?: string | null;
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

function mapSong(s: Song): Track {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album ?? undefined,
    artwork:
      s.cover_url ||
      "https://esjoifsjljvymttinyhj.supabase.co/storage/v1/object/public/covers/placeholder.jpg",
    url: s.audio_url,
    duration: s.duration_seconds ?? undefined,
    lyricsText: s.lyrics_text ?? undefined,
    genre: s.genre ?? undefined,
  };
}

export class SongsService {
  /** Carga todo el catálogo (paginado). Nuevas canciones en Supabase aparecen solas. */
  static async fetchAll(): Promise<Track[]> {
    const all: Song[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE - 1;
      const res = await fetch(
        `${Config.SUPABASE_URL}/rest/v1/${Config.SONGS_TABLE}?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: Config.SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${Config.SUPABASE_PUBLISHABLE_KEY}`,
            Accept: "application/json",
            Range: `${from}-${to}`,
            Prefer: "count=exact",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Supabase songs HTTP ${res.status}`);
      }

      const batch = (await res.json()) as Song[];
      if (!batch.length) break;
      all.push(...batch);
      if (batch.length < PAGE) break;
      from += PAGE;
    }

    return all
      .filter((s) => s.audio_url)
      .map(mapSong);
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
