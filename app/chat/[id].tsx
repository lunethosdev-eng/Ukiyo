import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMessages,
  sendMessage,
  setWallpaper,
  Message,
} from "@/services/chatService";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const nick = user?.nickname || "";
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [wallpaper, setWp] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const msgs = await fetchMessages(id);
    setMessages(msgs);
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const onSend = async () => {
    if (!text.trim() || !id || !nick) return;
    const body = text.trim();
    setText("");
    const m = await sendMessage(id, nick, body);
    if (m) setMessages((prev) => [...prev, m]);
  };

  const onWallpaper = () => {
    Alert.prompt?.(
      "Fondo del chat",
      "URL de imagen",
      async (url) => {
        if (!url || !id) return;
        await setWallpaper(id, url);
        setWp(url);
      }
    );
    // Android fallback
    if (Platform.OS === "android") {
      Alert.alert("Fondo", "Pega una URL de imagen en el siguiente campo del menú (próximamente). Por ahora escribe /fondo URL en un mensaje.");
    }
  };

  useEffect(() => {
    if (text.startsWith("/fondo ") && id) {
      const url = text.replace("/fondo ", "").trim();
      if (url.startsWith("http")) {
        setWallpaper(id, url).then(() => {
          setWp(url);
          setText("");
          Alert.alert("Fondo actualizado");
        });
      }
    }
  }, [text, id]);

  const content = (
    <>
      <Stack.Screen
        options={{
          title: "Chat",
          headerStyle: { backgroundColor: "#0a0a0c" },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable onPress={onWallpaper} style={{ marginRight: 8 }}>
              <Ionicons name="image-outline" size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.sender_nickname === nick;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              {!mine && (
                <Text style={styles.sender}>@{item.sender_nickname}</Text>
              )}
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Mensaje…"
            placeholderTextColor="#666"
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <Pressable style={styles.send} onPress={onSend}>
            <Ionicons name="send" size={20} color="#000" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );

  if (wallpaper) {
    return (
      <ImageBackground source={{ uri: wallpaper }} style={styles.root} imageStyle={{ opacity: 0.35 }}>
        <View style={styles.root}>{content}</View>
      </ImageBackground>
    );
  }

  return <View style={styles.root}>{content}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#6d28d9",
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: "#1c1c1e",
  },
  sender: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 2 },
  body: { color: "#fff", fontSize: 15, lineHeight: 20 },
  time: { color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#0a0a0c",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
