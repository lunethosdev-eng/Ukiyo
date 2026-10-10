import React from "react";
import { View, StyleSheet, Dimensions, Pressable, Text } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Canvas, RoundedRect } from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");

function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabHeight = 68;
  const margin = 22;
  const handleTabPress = (index: number) => {
    const route = state.routes[index];
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!state.routes[index] || event.defaultPrevented) return;
    if (state.index !== index) navigation.navigate(route.name);
  };

  return (
    <View style={[styles.tabContainer, { bottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.gestureArea}>
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <RoundedRect x={margin} y={0} width={width - margin * 2} height={tabHeight} r={28} color="rgba(18,22,32,0.94)" />
          <RoundedRect x={margin + 0.6} y={0.6} width={width - margin * 2 - 1.2} height={tabHeight - 1.2} r={27.4} color="rgba(255,255,255,0.07)" style="stroke" strokeWidth={1.2} />
        </Canvas>
        <View style={styles.iconRow}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key].options;
            const iconName = route.name === "search" ? "search" : route.name === "library" ? "musical-notes" : route.name === "profile" ? "person-circle" : "play-circle";
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
                <Ionicons name={iconName as any} size={26} color={focused ? "#fff" : "rgba(255,255,255,0.58)"} />
                <Text style={[styles.tabLabel, { color: focused ? "#fff" : "rgba(255,255,255,0.58)" }]}>{options.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <LiquidTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="search" options={{ title: "Buscar" }} />
      <Tabs.Screen name="library" options={{ title: "Biblioteca" }} />
      <Tabs.Screen name="profile" options={{ title: "Tú" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: { position: "absolute", left: 0, right: 0, height: 68, zIndex: 100, elevation: 100 },
  gestureArea: { flex: 1, width: "100%" },
  iconRow: { flexDirection: "row", height: 68, marginHorizontal: 22, alignItems: "center", justifyContent: "space-between" },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", height: "100%", borderRadius: 20 },
  pressed: { opacity: 0.65 },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
});
