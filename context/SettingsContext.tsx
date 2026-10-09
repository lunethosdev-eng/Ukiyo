import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@ukiyo/settings";

export type AppFont = "system" | "rounded" | "serif" | "mono";

export interface AppSettings {
  font: AppFont;
  reduceMotion: boolean;
  haptics: boolean;
  publicProfile: boolean;
  showListeningActivity: boolean;
  allowProfileBanner: boolean;
  experimentalLiquidNav: boolean;
  experimentalKaraoke: boolean;
  offlineOnly: boolean;
  autoDownload: boolean;
  crossfade: boolean;
  gapless: boolean;
  highQuality: boolean;
  dataSaver: boolean;
  privateSession: boolean;
  hideExplicit: boolean;
  shareStats: boolean;
  // expandable flags stored generically
  flags: Record<string, boolean>;
}

const DEFAULTS: AppSettings = {
  font: "system",
  reduceMotion: false,
  haptics: true,
  publicProfile: true,
  showListeningActivity: true,
  allowProfileBanner: true,
  experimentalLiquidNav: true,
  experimentalKaraoke: true,
  offlineOnly: false,
  autoDownload: false,
  crossfade: false,
  gapless: true,
  highQuality: true,
  dataSaver: false,
  privateSession: false,
  hideExplicit: false,
  shareStats: false,
  flags: {},
};

interface Ctx {
  settings: AppSettings;
  set: (patch: Partial<AppSettings>) => Promise<void>;
  setFlag: (key: string, value: boolean) => Promise<void>;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {}
    })();
  }, []);

  const set = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setFlag = useCallback(async (key: string, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, flags: { ...prev.flags, [key]: value } };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, set, setFlag }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings inside SettingsProvider");
  return ctx;
};

/** Catálogo de ~50+ toggles reales agrupados */
export const CUSTOMIZATION_CATALOG = {
  appearance: [
    { key: "font", label: "Fuente del sistema", type: "font" as const },
    { key: "reduceMotion", label: "Reducir movimiento", type: "bool" as const },
    { key: "haptics", label: "Háptica", type: "bool" as const },
    { key: "flag_compact_lists", label: "Listas compactas", type: "flag" as const },
    { key: "flag_large_artwork", label: "Carátulas grandes", type: "flag" as const },
    { key: "flag_show_lyrics_btn", label: "Botón de letras en mini player", type: "flag" as const },
    { key: "flag_dim_artwork", label: "Atenuar carátula al pausar", type: "flag" as const },
    { key: "flag_mono_icons", label: "Iconos monocromáticos", type: "flag" as const },
    { key: "flag_bold_titles", label: "Títulos en negrita", type: "flag" as const },
    { key: "flag_show_duration", label: "Mostrar duración en listas", type: "flag" as const },
  ],
  privacy: [
    { key: "publicProfile", label: "Perfil público", type: "bool" as const },
    { key: "showListeningActivity", label: "Actividad de escucha visible", type: "bool" as const },
    { key: "privateSession", label: "Sesión privada", type: "bool" as const },
    { key: "shareStats", label: "Compartir estadísticas", type: "bool" as const },
    { key: "hideExplicit", label: "Ocultar contenido explícito", type: "bool" as const },
    { key: "flag_hide_recent", label: "Ocultar recientes", type: "flag" as const },
    { key: "flag_hide_library", label: "Biblioteca privada", type: "flag" as const },
    { key: "flag_require_auth_profile", label: "Pedir login para ver perfil", type: "flag" as const },
    { key: "flag_blur_nsfw_covers", label: "Difuminar carátulas sensibles", type: "flag" as const },
    { key: "flag_no_analytics", label: "Sin analítica local", type: "flag" as const },
  ],
  playback: [
    { key: "gapless", label: "Reproducción continua", type: "bool" as const },
    { key: "crossfade", label: "Crossfade", type: "bool" as const },
    { key: "highQuality", label: "Alta calidad", type: "bool" as const },
    { key: "dataSaver", label: "Ahorro de datos", type: "bool" as const },
    { key: "autoDownload", label: "Descarga automática", type: "bool" as const },
    { key: "offlineOnly", label: "Solo offline", type: "bool" as const },
    { key: "flag_normalize_volume", label: "Normalizar volumen", type: "flag" as const },
    { key: "flag_remember_position", label: "Recordar posición", type: "flag" as const },
    { key: "flag_autoplay_similar", label: "Autoplay similares", type: "flag" as const },
    { key: "flag_sleep_timer", label: "Temporizador de sueño", type: "flag" as const },
  ],
  experimental: [
    { key: "experimentalLiquidNav", label: "Nav Liquid Glass", type: "bool" as const },
    { key: "experimentalKaraoke", label: "Karaoke experimental", type: "bool" as const },
    { key: "flag_skia_gooey", label: "Gooey Skia", type: "flag" as const },
    { key: "flag_live_lyrics", label: "Letras en vivo", type: "flag" as const },
    { key: "flag_ai_mix", label: "Mezclas sugeridas", type: "flag" as const },
    { key: "flag_waveform_seek", label: "Seek por forma de onda", type: "flag" as const },
    { key: "flag_spatial_hint", label: "Pista espacial (hint)", type: "flag" as const },
    { key: "flag_gesture_seek", label: "Seek por gestos", type: "flag" as const },
    { key: "flag_dynamic_island_style", label: "Mini player estilo island", type: "flag" as const },
    { key: "flag_haptic_beat", label: "Háptica al beat", type: "flag" as const },
  ],
  extras: [
    { key: "allowProfileBanner", label: "Banner de perfil", type: "bool" as const },
    { key: "flag_eq_presets", label: "Presets de ecualizador", type: "flag" as const },
    { key: "flag_queue_reorder", label: "Reordenar cola", type: "flag" as const },
    { key: "flag_share_song", label: "Compartir canción", type: "flag" as const },
    { key: "flag_car_mode", label: "Modo conducción", type: "flag" as const },
    { key: "flag_widget_hint", label: "Widgets (próx.)", type: "flag" as const },
    { key: "flag_scrobble", label: "Scrobble local", type: "flag" as const },
    { key: "flag_duplicates", label: "Detectar duplicados", type: "flag" as const },
    { key: "flag_import_playlists", label: "Importar playlists", type: "flag" as const },
    { key: "flag_beta_updates", label: "Canal beta", type: "flag" as const },
  ],
} as const;
