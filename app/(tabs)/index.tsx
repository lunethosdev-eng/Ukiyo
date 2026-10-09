// app/(tabs)/index.tsx  –  "Para Ti"
import React from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuroraBackground } from "@/components/liquid/AuroraBackground";
import { AlbumCarousel } from "@/components/carousels/AlbumCarousel";
import { MoodSection } from "@/components/ui/MoodSection";
import { usePlayback } from "@/context/PlaybackContext";

export default function ForYouScreen() {
  const { isOffline } = usePlayback();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AuroraBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Para Ti</Text>
          {isOffline && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>

        <AlbumCarousel title="Escuchado recientemente" />
        <MoodSection />
        <AlbumCarousel title="Hecho para ti" />
        <AlbumCarousel title="Nuevos lanzamientos" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0618" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  offlineBadge: {
    backgroundColor: "rgba(239,68,68,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.5)",
  },
  offlineText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "600",
  },
});
