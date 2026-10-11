import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  listMessageRequests,
  respondRequest,
  MessageRequest,
} from "@/services/chatService";

export default function RequestsScreen() {
  const { user } = useAuth();
  const nick = user?.nickname || "";
  const router = useRouter();
  const [list, setList] = useState<MessageRequest[]>([]);

  const load = useCallback(async () => {
    if (!nick) return;
    setList(await listMessageRequests(nick));
  }, [nick]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: "Solicitudes",
          headerStyle: { backgroundColor: "#0a0a0c" },
          headerTintColor: "#fff",
        }}
      />
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay solicitudes pendientes</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.from}>@{item.from_nickname}</Text>
            {!!item.body && <Text style={styles.body}>{item.body}</Text>}
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, { backgroundColor: "#333" }]}
                onPress={async () => {
                  await respondRequest(item.id, false, nick, item.from_nickname);
                  load();
                }}
              >
                <Text style={styles.btnText}>Rechazar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, { backgroundColor: "#a78bfa" }]}
                onPress={async () => {
                  const id = await respondRequest(
                    item.id,
                    true,
                    nick,
                    item.from_nickname
                  );
                  load();
                  if (id) router.replace(`/chat/${id}`);
                }}
              >
                <Text style={[styles.btnText, { color: "#000" }]}>Aceptar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  empty: { color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#121214",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  from: { color: "#fff", fontWeight: "700", fontSize: 16 },
  body: { color: "rgba(255,255,255,0.6)", marginTop: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
