import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { AuthProvider } from "@/context/AuthContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { ExpandablePlayer } from "@/components/player/ExpandablePlayer";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <AuthProvider>
        <CatalogProvider>
          <PlaybackProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#000" },
                animation: "fade",
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="player/karaoke"
                options={{
                  presentation: "fullScreenModal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
            <ExpandablePlayer />
          </PlaybackProvider>
        </CatalogProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
