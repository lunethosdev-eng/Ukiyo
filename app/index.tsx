// app/index.tsx – redirect to welcome
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
