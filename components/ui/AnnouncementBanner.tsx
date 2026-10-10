import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import {
  fetchAnnouncements,
  loadRemoteConfig,
  Announcement,
} from "@/services/remoteConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SEEN_KEY = "@ukiyo/ann_seen";

export function AnnouncementBanner() {
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  const check = useCallback(async () => {
    try {
      // refresca URL SEKI + config
      await loadRemoteConfig();
      const list = await fetchAnnouncements();
      if (!list.length) return;
      const latest = list[0];
      const seen = await AsyncStorage.getItem(SEEN_KEY);
      if (seen === latest.id) return;
      setAnn(latest);
      setOpen(true);
    } catch {}
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [check]);

  const dismiss = async () => {
    if (ann) await AsyncStorage.setItem(SEEN_KEY, ann.id);
    setOpen(false);
  };

  if (!ann) return null;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView>
            {!!ann.image_url && (
              <Image
                source={{ uri: ann.image_url }}
                style={styles.img}
                resizeMode="cover"
              />
            )}
            <Text style={styles.title}>{ann.title}</Text>
            {!!ann.body && <Text style={styles.body}>{ann.body}</Text>}
          </ScrollView>
          <Pressable style={styles.btn} onPress={dismiss}>
            <Text style={styles.btnText}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#12141c",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    maxHeight: "80%",
  },
  img: { width: "100%", height: 180, borderRadius: 12, marginBottom: 14 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  body: { color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 22 },
  btn: {
    marginTop: 16,
    backgroundColor: "#6d28d9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
