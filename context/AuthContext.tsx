import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { upsertMyProfile } from "@/services/socialService";

const KEY = "@ukiyo/auth";
const USERS_KEY = "@ukiyo/users_local";
const OWNER_EMAIL = "lunethos.dev@gmail.com";

export type BadgeLevel = "none" | "artist" | "verified" | "exclusive" | "admin" | "owner";

export interface UserProfile {
  name: string;
  nickname: string;
  email: string;
  photoUri?: string | null;
  bannerUri?: string | null;
  isGuest?: boolean;
  bio?: string;
  isPublic?: boolean;
  /** Programa artistas */
  isArtist?: boolean;
  artistLastName?: string;
  followers?: number;
  following?: number;
  likes?: number;
  visits?: number;
  badge?: BadgeLevel;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    nickname: string;
    email: string;
    password: string;
  }) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  applyAsArtist: (lastName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function computeBadge(u: Partial<UserProfile>): BadgeLevel {
  const email = (u.email || "").toLowerCase().trim();
  if (email === OWNER_EMAIL) return "owner";
  if (u.badge === "admin") return "admin";
  const followers = u.followers ?? 0;
  if (u.isArtist) {
    if (followers >= 1000) return "exclusive";
    if (followers >= 50) return "verified";
    return "artist";
  }
  return "none";
}

function withBadge(u: UserProfile): UserProfile {
  return { ...u, badge: computeBadge(u) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setUser(withBadge(JSON.parse(raw)));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = async (u: UserProfile | null) => {
    const next = u ? withBadge(u) : null;
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      if (!next.isGuest && next.nickname) {
        upsertMyProfile({
          nickname: next.nickname,
          name: next.name,
          email: next.email,
          photo_uri: next.photoUri,
          banner_uri: next.bannerUri,
          bio: next.bio,
          badge: next.badge,
          is_artist: next.isArtist,
          is_public: next.isPublic,
        }).catch(() => {});
      }
    } else await AsyncStorage.removeItem(KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    // Buscar usuario local registrado
    let found: UserProfile | null = null;
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const map = raw ? JSON.parse(raw) : {};
      const entry = map[email.trim().toLowerCase()];
      if (entry && entry.password === password) {
        found = entry.profile;
      }
    } catch {}
    if (found) {
      await persist({ ...found, isGuest: false });
      return;
    }
    // fallback: sesión simple
    await persist({
      name: email.split("@")[0],
      nickname: email.split("@")[0].toLowerCase(),
      email: email.trim(),
      photoUri: null,
      bannerUri: null,
      isGuest: false,
      isPublic: true,
      bio: "",
      followers: 0,
      following: 0,
      likes: 0,
      visits: 0,
    });
  }, []);

  const register = useCallback(
    async (data: { name: string; nickname: string; email: string; password: string }) => {
      const profile: UserProfile = {
        name: data.name.trim(),
        nickname: data.nickname.trim().replace(/\s+/g, "").toLowerCase(),
        email: data.email.trim(),
        photoUri: null,
        bannerUri: null,
        isGuest: false,
        isPublic: true,
        bio: "",
        followers: 0,
        following: 0,
        likes: 0,
        visits: 0,
      };
      try {
        const raw = await AsyncStorage.getItem(USERS_KEY);
        const map = raw ? JSON.parse(raw) : {};
        map[data.email.trim().toLowerCase()] = { password: data.password, profile };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(map));
      } catch {}
      await persist(profile);
    },
    []
  );

  const continueAsGuest = useCallback(async () => {
    await persist({
      name: "Invitado",
      nickname: "guest",
      email: "",
      isGuest: true,
      isPublic: false,
      photoUri: null,
      bannerUri: null,
      followers: 0,
      following: 0,
    });
  }, []);

  const logout = useCallback(async () => {
    await persist(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = withBadge({ ...prev, ...patch });
        AsyncStorage.setItem(KEY, JSON.stringify(next));
        // sync users map
        (async () => {
          try {
            const raw = await AsyncStorage.getItem(USERS_KEY);
            const map = raw ? JSON.parse(raw) : {};
            const k = (next.email || "").toLowerCase();
            if (k && map[k]) {
              map[k].profile = next;
              await AsyncStorage.setItem(USERS_KEY, JSON.stringify(map));
            }
          } catch {}
        })();
        return next;
      });
    },
    []
  );

  const applyAsArtist = useCallback(
    async (lastName: string) => {
      setUser((prev) => {
        if (!prev || prev.isGuest) return prev;
        const next = withBadge({
          ...prev,
          isArtist: true,
          artistLastName: lastName.trim(),
        });
        AsyncStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        continueAsGuest,
        logout,
        updateProfile,
        applyAsArtist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export { OWNER_EMAIL };
