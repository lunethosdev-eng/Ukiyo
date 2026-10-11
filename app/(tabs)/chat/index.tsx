import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  listConversations,
  listMessageRequests,
  createGroup,
  Conversation,
  MessageRequest,
} from "@/services/chatService";

export default function ChatListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const nick = user?.nickname || "";
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMembers, setGroupMembers] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!nick || user?.isGuest) return;
    const [c, r] = await Promise.all([
      listConversations(nick),
      listMessageRequests(nick),
    ]);
    setConvs(c);
    setRequests(r);
  }, [nick, user?.isGuest]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (user?.isGuest || !nick) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.heading}>Chat</Text>
        <Text style={styles.empty}>Inicia sesión para chatear</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.top}>
        <Text style={styles.heading}>Chat</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={() => router.push("/chat/requests")}>
            <Ionicons name="mail-outline" size={24} color="#fff" />
            {requests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requests.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => setGroupOpen(true)}>
            <Ionicons name="people-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={convs}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Sin conversaciones aún</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Ionicons
                name={item.is_group ? "people" : "person"}
                size={22}
                color="#fff"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {item.is_group
                  ? item.title || "Grupo"
                  : item.title || "Chat privado"}
              </Text>
              <Text style={styles.sub}>
                {new Date(item.updated_at).toLocaleString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </Pressable>
        )}
      />

      <Modal visible={groupOpen} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo grupo</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del grupo"
              placeholderTextColor="#666"
              value={groupTitle}
              onChangeText={setGroupTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Miembros (nicknames separados por coma)"
              placeholderTextColor="#666"
              value={groupMembers}
              onChangeText={setGroupMembers}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                style={[styles.btn, { backgroundColor: "#333" }]}
                onPress={() => setGroupOpen(false)}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, { backgroundColor: "#a78bfa" }]}
                onPress={async () => {
                  const members = groupMembers
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (!groupTitle.trim()) {
                    Alert.alert("Pon un nombre");
                    return;
                  }
                  const id = await createGroup(nick, groupTitle.trim(), members);
                  setGroupOpen(false);
                  if (id) router.push(`/chat/${id}`);
                }}
              >
                <Text style={[styles.btnText, { color: "#000" }]}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  heading: { color: "#fff", fontSize: 28, fontWeight: "700" },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  empty: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 48,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#121214",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  btn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
