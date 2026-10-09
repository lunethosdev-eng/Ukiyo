import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useSettings,
  CUSTOMIZATION_CATALOG,
  AppFont,
} from "@/context/SettingsContext";

const FONT_OPTIONS: { id: AppFont; label: string }[] = [
  { id: "system", label: "Sistema" },
  { id: "rounded", label: "Rounded" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, set, setFlag } = useSettings();

  const renderBool = (key: string, label: string, isFlag: boolean) => {
    const value = isFlag
      ? !!settings.flags[key]
      : !!(settings as any)[key];
    return (
      <View key={key} style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Switch
          value={value}
          onValueChange={(v) => {
            if (isFlag) setFlag(key, v);
            else set({ [key]: v } as any);
          }}
          trackColor={{ false: "#333", true: "#f5f5f7" }}
          thumbColor="#0c0c0e"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Atrás</Text>
        </Pressable>
        <Text style={styles.title}>Personalización</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.section}>Fuente</Text>
        <View style={styles.fontRow}>
          {FONT_OPTIONS.map((f) => (
            <Pressable
              key={f.id}
              style={[
                styles.fontChip,
                settings.font === f.id && styles.fontChipOn,
              ]}
              onPress={() => set({ font: f.id })}
            >
              <Text
                style={[
                  styles.fontChipText,
                  settings.font === f.id && styles.fontChipTextOn,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {(
          [
            ["Apariencia", CUSTOMIZATION_CATALOG.appearance],
            ["Privacidad", CUSTOMIZATION_CATALOG.privacy],
            ["Reproducción", CUSTOMIZATION_CATALOG.playback],
            ["Experimentales", CUSTOMIZATION_CATALOG.experimental],
            ["Extras", CUSTOMIZATION_CATALOG.extras],
          ] as const
        ).map(([title, items]) => (
          <View key={title}>
            <Text style={styles.section}>{title}</Text>
            <View style={styles.card}>
              {items.map((item) => {
                if (item.type === "font") return null;
                return renderBool(
                  item.key,
                  item.label,
                  item.type === "flag"
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0c0e" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  back: { color: "rgba(245,245,247,0.55)", fontSize: 16, marginBottom: 4 },
  title: {
    color: "#f5f5f7",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  section: {
    color: "rgba(245,245,247,0.45)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 20,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  label: { color: "#f5f5f7", fontSize: 15, flex: 1, paddingRight: 12 },
  fontRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
  },
  fontChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1c1c1e",
  },
  fontChipOn: { backgroundColor: "#f5f5f7" },
  fontChipText: { color: "rgba(245,245,247,0.7)", fontWeight: "600" },
  fontChipTextOn: { color: "#0c0c0e" },
});
