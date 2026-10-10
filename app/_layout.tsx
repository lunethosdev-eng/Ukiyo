import React, { Component, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { PlaybackProvider } from "@/context/PlaybackContext";
import { AuthProvider } from "@/context/AuthContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ExpandablePlayer } from "@/components/player/ExpandablePlayer";
import { loadRemoteConfig } from "@/services/remoteConfig";

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={eb.box}>
          <Text style={eb.title}>Error en la app</Text>
          <Text style={eb.msg}>{String(this.state.error?.message ?? this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  box: { flex: 1, backgroundColor: "#000", justifyContent: "center", padding: 24 },
  title: { color: "#f87171", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  msg: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
});

function Bootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadRemoteConfig();
      } catch {
        /* offline / sin config: continuar */
      }
      if (!cancelled) setReady(true);
    })();
    const t = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#a78bfa" size="large" />
      </View>
    );
  }
  return <>{children}</>;
}

/** Layout de la app de USUARIOS (sin panel admin). */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <ErrorBoundary>
        <Bootstrap>
          <AuthProvider>
            <SettingsProvider>
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
                    <Stack.Screen name="settings/index" />
                  </Stack>
                  <ExpandablePlayer />
                </PlaybackProvider>
              </CatalogProvider>
            </SettingsProvider>
          </AuthProvider>
        </Bootstrap>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
