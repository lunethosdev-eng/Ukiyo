import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const KEY = "@ukiyo/auth";

export interface UserProfile {
  name: string;
  email: string;
  photoUri?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, name?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  pickProfilePhoto: () => Promise<void>;
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

  const login = useCallback(async (email: string, _password: string, name?: string) => {
    const existing = await AsyncStorage.getItem(KEY);
    let photoUri: string | null = null;
    if (existing) {
      try {
        photoUri = JSON.parse(existing)?.photoUri ?? null;
      } catch {}
    }
    await persist({
      name: name || email.split("@")[0],
      email,
      photoUri,
    });
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    await persist({ name, email, photoUri: null });
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

  const pickProfilePhoto = useCallback(async () => {
    Alert.alert(
      "Foto de perfil",
      "La galería se activará cuando expo-image-picker esté en package.json. La sesión ya se guarda al cerrar la app."
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, pickProfilePhoto }}
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
