import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@ukiyo/auth";

export interface UserProfile {
  name: string;
  nickname: string;
  email: string;
  photoUri?: string | null;
  bannerUri?: string | null;
  isGuest?: boolean;
  bio?: string;
  isPublic?: boolean;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = async (u: UserProfile | null) => {
    setUser(u);
    if (u) await AsyncStorage.setItem(KEY, JSON.stringify(u));
    else await AsyncStorage.removeItem(KEY);
  };

  const login = useCallback(async (email: string, _password: string) => {
    const raw = await AsyncStorage.getItem(KEY);
    let prev: Partial<UserProfile> = {};
    if (raw) {
      try {
        prev = JSON.parse(raw);
      } catch {}
    }
    await persist({
      name: prev.name || email.split("@")[0],
      nickname: prev.nickname || email.split("@")[0],
      email,
      photoUri: prev.photoUri ?? null,
      bannerUri: prev.bannerUri ?? null,
      isGuest: false,
      isPublic: prev.isPublic ?? true,
      bio: prev.bio ?? "",
    });
  }, []);

  const register = useCallback(
    async (data: { name: string; nickname: string; email: string; password: string }) => {
      await persist({
        name: data.name.trim(),
        nickname: data.nickname.trim().replace(/\s+/g, "").toLowerCase(),
        email: data.email.trim(),
        photoUri: null,
        bannerUri: null,
        isGuest: false,
        isPublic: true,
        bio: "",
      });
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
    });
  }, []);

  const logout = useCallback(async () => {
    await persist(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth inside AuthProvider");
  return ctx;
};
