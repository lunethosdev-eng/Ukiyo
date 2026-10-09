// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { LiquidProvider } from "@/components/liquid/LiquidProvider";
import { ExpandablePlayer } from "@/components/player/ExpandablePlayer";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlaybackProvider>
        <LiquidProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0A0618" },
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
        </LiquidProvider>
      </PlaybackProvider>
    </GestureHandlerRootView>
  );
}
