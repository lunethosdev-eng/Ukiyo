// app/player/karaoke.tsx
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KaraokeLyrics } from "@/components/karaoke/KaraokeLyrics";
import { SafeAreaView } from "react-native-safe-area-context";

export default function KaraokeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <KaraokeLyrics />
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Ionicons name="chevron-down" size={32} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
