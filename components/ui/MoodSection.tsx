// components/ui/MoodSection.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const MOODS = [
  { id: "1", label: "Chill", colors: ["#6366F1", "#8B5CF6"] },
  { id: "2", label: "Energía", colors: ["#F43F5E", "#F97316"] },
  { id: "3", label: "Focus", colors: ["#0EA5E9", "#6366F1"] },
  { id: "4", label: "Sad", colors: ["#64748B", "#334155"] },
  { id: "5", label: "Party", colors: ["#EC4899", "#A855F7"] },
];

export function MoodSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Moods</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {MOODS.map((m) => (
          <Pressable key={m.id}>
            <LinearGradient
              colors={m.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{m.label}</Text>
            </LinearGradient>
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
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  chipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
