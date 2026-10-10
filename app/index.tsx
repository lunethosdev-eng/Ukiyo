import { Redirect } from "expo-router";
import { View } from "react-native";
import { IS_ADMIN_APP } from "@/constants/AppVariant";
import { UserIndex } from "@/components/UserIndex";

export default function Index() {
  if (IS_ADMIN_APP) {
    return <Redirect href="/admin" />;
  }
  return <UserIndex />;
}
