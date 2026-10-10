import { Config } from "@/constants/Config";

export interface LyricLine {
  time: number;
  text: string;
}

export interface SyncedLyrics {
  lines: LyricLine[];
  duration?: number;
  source?: string;
}

/** Parsea formato LRC [mm:ss.xx]texto */
export function parseLRC(lrc: string): SyncedLyrics {
  const lines: LyricLine[] = [];
  const regex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/g;
  let match;
  while ((match = regex.exec(lrc)) !== null) {
    const min = parseInt(match[1], 10);
    const sec = parseInt(match[2], 10);
    const frac = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0;
    const time = min * 60 + sec + frac / 1000;
    const text = match[4].trim();
    if (text) lines.push({ time, text });
  }
  return { lines, source: "lrc" };
}

function plainToLines(text: string): SyncedLyrics {
  const lines = text
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t, i) => ({ time: i * 3.5, text: t }));
  return { lines, source: "plain" };
}

/** Usa lyrics del track (DB) si vienen en LRC o texto. */
export function lyricsFromTrackText(lyricsText?: string | null): SyncedLyrics | null {
  if (!lyricsText?.trim()) return null;
  if (/\[\d{1,2}:\d{2}/.test(lyricsText)) {
    const parsed = parseLRC(lyricsText);
    if (parsed.lines.length) return { ...parsed, source: "db" };
  }
  return plainToLines(lyricsText);
}

/**
 * LRCLIB: primero /get exacto, luego /search.
 */
export async function fetchLyrics(
  trackName: string,
  artistName: string,
  albumName?: string,
  duration?: number
): Promise<SyncedLyrics | null> {
  try {
    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });
    if (albumName) params.set("album_name", albumName);
    if (duration) params.set("duration", String(Math.round(duration)));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${Config.LRCLIB_BASE}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.syncedLyrics) {
        const p = parseLRC(data.syncedLyrics);
        if (p.lines.length) return { ...p, source: "lrclib" };
      }
      if (data?.plainLyrics) return { ...plainToLines(data.plainLyrics), source: "lrclib-plain" };
    }

    // Fallback search
    const sParams = new URLSearchParams({
      q: `${artistName} ${trackName}`,
    });
    const sRes = await fetch(`${Config.LRCLIB_SEARCH}?${sParams.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!sRes.ok) return null;
    const results = await sRes.json();
    if (!Array.isArray(results) || !results.length) return null;

    // Pick best match with synced lyrics
    const best =
      results.find((r: any) => r.syncedLyrics) ||
      results.find((r: any) => r.plainLyrics) ||
      results[0];

    // Search endpoint often only returns metadata — fetch by id if needed
    if (best?.syncedLyrics) {
      const p = parseLRC(best.syncedLyrics);
      if (p.lines.length) return { ...p, source: "lrclib-search" };
    }
    if (best?.id) {
      const getRes = await fetch(`${Config.LRCLIB_BASE}?track_name=${encodeURIComponent(best.trackName || trackName)}&artist_name=${encodeURIComponent(best.artistName || artistName)}`, {
        headers: { Accept: "application/json" },
      });
      if (getRes.ok) {
        const d = await getRes.json();
        if (d?.syncedLyrics) {
          const p = parseLRC(d.syncedLyrics);
          if (p.lines.length) return { ...p, source: "lrclib" };
        }
        if (d?.plainLyrics) return { ...plainToLines(d.plainLyrics), source: "lrclib-plain" };
      }
    }
    if (best?.plainLyrics) return { ...plainToLines(best.plainLyrics), source: "lrclib-plain" };

    return null;
  } catch {
    return null;
  }
}
