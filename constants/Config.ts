/**
 * Kokoro Supabase = config global, anuncios, push tokens (conector Kokoro).
 * CATALOG_* = catálogo de canciones (si usas otra instancia, cámbialo aquí).
 */
export const Config = {
  // Kokoro (Ukiyo admin / config remota)
  SUPABASE_URL: "https://ajbmpgnzkgtcmulocftd.supabase.co",
  SUPABASE_PUBLISHABLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYm1wZ256a2d0Y211bG9jZnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDU2MjksImV4cCI6MjEwNTkyMTYyOX0.twsBnT9WBBILyXFuoQh7viI578yoNbeQztKHsr8DB8k",

  // Catálogo (misma instancia Kokoro; tabla tracks)
  CATALOG_URL: "https://ajbmpgnzkgtcmulocftd.supabase.co",
  CATALOG_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYm1wZ256a2d0Y211bG9jZnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDU2MjksImV4cCI6MjEwNTkyMTYyOX0.twsBnT9WBBILyXFuoQh7viI578yoNbeQztKHsr8DB8k",
  SONGS_TABLE: "tracks",
  SUPABASE_BUCKET: "audio",

  SEKI_API_URL: "https://tricky-dingo-37.loca.lt",
  SEKI_API_KEY: "kokoro-seki-2026",
  LRCLIB_BASE: "https://lrclib.net/api/get",
  ADMIN_PIN: "ukiyo2026",
} as const;

export const RuntimeConfig = {
  SEKI_API_URL: Config.SEKI_API_URL as string,
  SEKI_API_KEY: Config.SEKI_API_KEY as string,
  ADMIN_PIN: Config.ADMIN_PIN as string,
};

export function applyRemoteConfig(map: Record<string, string>) {
  if (map.seki_api_url) {
    RuntimeConfig.SEKI_API_URL = map.seki_api_url.replace(/\/$/, "");
  }
  if (map.seki_api_key) RuntimeConfig.SEKI_API_KEY = map.seki_api_key;
  if (map.admin_pin) RuntimeConfig.ADMIN_PIN = map.admin_pin;
}
