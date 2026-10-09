import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/welcome" />;
}
