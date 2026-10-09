// components/carousels/PlaylistSection.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { LiquidGlassCard } from "@/components/liquid/LiquidGlassCard";

const PLAYLISTS = [
  {
    id: "p1",
    title: "Late Night Drive",
    cover: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed849fde87625f",
  },
  {
    id: "p2",
    title: "Focus Flow",
    cover: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
  },
  {
    id: "p3",
    title: "Summer Vibes",
    cover: "https://i.scdn.co/image/ab67616d0000b273ef24c3fdbf856340d55cfeb2",
  },
];

interface Props {
  title: string;
}

export function PlaylistSection({ title }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
      >
        {PLAYLISTS.map((p) => (
          <Pressable key={p.id}>
            <LiquidGlassCard borderRadius={16} style={{ width: 160, padding: 0 }}>
              <Image source={{ uri: p.cover }} style={styles.cover} />
              <Text style={styles.playlistTitle} numberOfLines={1}>
                {p.title}
              </Text>
            </LiquidGlassCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 20,
    marginBottom: 14,
  },
  cover: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  playlistTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    padding: 12,
  },
});
