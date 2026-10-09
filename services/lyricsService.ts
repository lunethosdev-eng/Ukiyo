// services/lyricsService.ts
import { Config } from "@/constants/Config";

export interface LyricLine {
  time: number; // seconds
  text: string;
}

export interface SyncedLyrics {
  lines: LyricLine[];
  duration?: number;
}

/**
 * Fetch synced lyrics from LRCLIB
 * Returns LRC-parsed lines with timestamps
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
      ...(albumName && { album_name: albumName }),
      ...(duration && { duration: String(Math.round(duration)) }),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${Config.LRCLIB_BASE}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.syncedLyrics) return null;

    return parseLRC(data.syncedLyrics);
  } catch {
    return null;
  }
}

/** Simple LRC parser */
function parseLRC(lrc: string): SyncedLyrics {
  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
  let match;

  while ((match = regex.exec(lrc)) !== null) {
    const min = parseInt(match[1], 10);
    const sec = parseInt(match[2], 10);
    const ms = parseInt(match[3].padEnd(3, "0"), 10);
    const time = min * 60 + sec + ms / 1000;
    const text = match[4].trim();
    if (text) lines.push({ time, text });
  }

  return { lines };
}
