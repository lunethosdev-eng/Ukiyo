import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { SongsService, Track } from "@/services/songsService";

interface CatalogContextType {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SongsService.fetchAll();
      setTracks(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Auto-refresh cada 5 min por si suben canciones nuevas
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <CatalogContext.Provider value={{ tracks, loading, error, refresh }}>
      {children}
    </CatalogContext.Provider>
  );
}

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog inside CatalogProvider");
  return ctx;
};
