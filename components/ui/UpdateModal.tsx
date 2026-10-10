import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Linking } from "react-native";
import { checkForUpdate } from "@/services/updateService";

export function UpdateModal() {
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [tag, setTag] = useState("");

  useEffect(() => {
    (async () => {
      const info = await checkForUpdate();
      if (info.hasUpdate && info.htmlUrl) {
        setUrl(info.htmlUrl);
        setTag(info.latestTag || "");
        setVisible(true);
      }
    })();
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.bg}>
        <View style={styles.card}>
          <Text style={styles.title}>Nueva versión {tag ? `v${tag}` : ""}</Text>
          <Text style={styles.body}>
            Hay una actualización de Ukiyo disponible. ¿Quieres actualizar ahora?
          </Text>
          <Pressable
            style={styles.primary}
            onPress={() => {
              if (url) Linking.openURL(url);
              setVisible(false);
            }}
          >
            <Text style={styles.primaryText}>Actualizar</Text>
          </Pressable>
          <Pressable onPress={() => setVisible(false)}>
            <Text style={styles.later}>Más tarde</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 28,
  },
  card: {
    backgroundColor: "#16161a",
    borderRadius: 20,
    padding: 24,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  body: { color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 20, marginBottom: 20 },
  primary: {
    backgroundColor: "#a78bfa",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "#000", fontWeight: "700", fontSize: 16 },
  later: {
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    marginTop: 14,
    fontSize: 14,
  },
});
