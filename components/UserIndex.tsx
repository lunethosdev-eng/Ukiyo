import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/context/AuthContext";

export function UserIndex() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/welcome" />;
}
