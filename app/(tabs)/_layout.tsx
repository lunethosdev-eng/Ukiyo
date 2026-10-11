import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const handleTabPress = (index: number) => {
    const route = state.routes[index];
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!state.routes[index] || event.defaultPrevented) return;
    if (state.index !== index) navigation.navigate(route.name);
  };

  const iconFor = (name: string) => {
    if (name === "search") return "search";
    if (name === "library") return "musical-notes";
    if (name === "chat") return "chatbubbles";
    if (name === "profile" || name === "profile/index") return "person-circle";
    return "play-circle";
  };

  return (
    <View style={[styles.tabContainer, { bottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          // skip hidden routes
          if ((options as any).href === null) return null;
          const iconName = iconFor(route.name);
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={String(options.title ?? route.name)}
              onPress={() => handleTabPress(index)}
              hitSlop={6}
              style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={focused ? "#fff" : "rgba(255,255,255,0.58)"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? "#fff" : "rgba(255,255,255,0.58)" },
                ]}
              >
                {options.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <LiquidTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="search" options={{ title: "Buscar" }} />
      <Tabs.Screen name="library" options={{ title: "Biblioteca" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="profile" options={{ title: "Tú" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: "rgba(20,20,24,0.92)",
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  pressed: { opacity: 0.7 },
  tabLabel: { fontSize: 10, fontWeight: "600" },
});
