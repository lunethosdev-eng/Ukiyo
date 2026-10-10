import { Config } from "@/constants/Config";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration_seconds?: number | null;
  audio_url?: string | null;
  cover_url?: string | null;
  animated_cover_url?: string | null;
  lyrics_text?: string | null;
  lyrics_url?: string | null;
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
  youtubeId?: string;
}

const PAGE = 500;

function mapSong(s: Song): Track {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album ?? undefined,
    artwork: s.cover_url || "",
    url: s.audio_url || "",
    duration: s.duration_seconds ?? undefined,
    lyricsText: s.lyrics_text ?? undefined,
    genre: s.genre ?? undefined,
    youtubeId: s.youtube_id ?? undefined,
  };
}

export class SongsService {
  static async fetchAll(): Promise<Track[]> {
    const all: Song[] = [];
    let from = 0;

    while (true) {
      const to = from + PAGE - 1;
      const res = await fetch(
        `${Config.CATALOG_URL}/rest/v1/${Config.SONGS_TABLE}?select=id,title,artist,album,duration_seconds,audio_url,cover_url,animated_cover_url,lyrics_text,lyrics_url,genre,youtube_id&order=created_at.desc`,
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
        throw new Error(`Catálogo HTTP ${res.status}`);
      }

      const batch = (await res.json()) as Song[];
      if (!batch.length) break;
      all.push(...batch);
      if (batch.length < PAGE) break;
      from += PAGE;
    }

    return all.filter((s) => !!s.audio_url).map(mapSong);
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
