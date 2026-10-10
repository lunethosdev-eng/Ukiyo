import { Redirect } from "expo-router";
import { View } from "react-native";
import { getIsAdminApp } from "@/constants/AppVariant";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  if (getIsAdminApp()) {
    return <Redirect href="/admin" />;
  }
  return <UserIndex />;
}

function UserIndex() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/welcome" />;
}
