import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Buscar</Text>
      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        <LiquidGlass borderRadius={14} intensity={40} style={styles.searchBar}>
          <TextInput 
            style={styles.input} 
            placeholder="Canciones, artistas, álbumes..." 
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={setQuery}
          />
        </LiquidGlass>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c0c0e" },
  title: { color: "#f5f5f7", fontSize: 28, fontWeight: "700", marginLeft: 20, marginTop: 8 },
  searchBar: { height: 50, justifyContent: "center" },
  input: { color: "#fff", paddingHorizontal: 16, fontSize: 16, height: "100%" }
});
