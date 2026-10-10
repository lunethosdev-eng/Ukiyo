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

  return (
    <View style={[styles.tabContainer, { bottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key].options;
          const iconName =
            route.name === "search"
              ? "search"
              : route.name === "library"
                ? "musical-notes"
                : route.name === "profile"
                  ? "person-circle"
                  : "play-circle";
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
                size={26}
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
      <Tabs.Screen name="profile" options={{ title: "Tú" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 68,
    zIndex: 100,
    elevation: 100,
    paddingHorizontal: 22,
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(18,22,32,0.94)",
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  pressed: { opacity: 0.65 },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
});
