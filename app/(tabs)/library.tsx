import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Tu Biblioteca</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Guarda música para verla aquí.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0c0e" },
  title: { color: "#f5f5f7", fontSize: 28, fontWeight: "700", marginLeft: 20, marginTop: 8 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "rgba(255,255,255,0.5)", fontSize: 16 }
});
