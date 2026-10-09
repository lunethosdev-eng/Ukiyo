import React from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { LiquidProvider } from "@/components/liquid/LiquidProvider"; // Tu Skia provider

const { width } = Dimensions.get("window");

function LiquidTabItem({ icon, isFocused, onPress }: { icon: any, isFocused: boolean, onPress: () => void }) {
  const pullY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      // Limita la deformación hacia arriba para que parezca una gota tensa
      pullY.value = Math.max(e.translationY, -60);
    })
    .onEnd(() => {
      // Físicas de rebote (bounce) estilo Apple
      pullY.value = withSpring(0, { damping: 10, stiffness: 200, mass: 0.8 });
    });

  const dropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
    opacity: isFocused ? 1 : 0,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Pressable onPress={onPress} style={styles.tabItem}>
        {/* Esta es la "gota" que se estirará. El LiquidProvider la fusionará con la barra */}
        <Animated.View style={[styles.activeDrop, dropStyle]} />
        <Ionicons 
          name={icon} 
          size={24} 
          color={isFocused ? "#fff" : "rgba(255,255,255,0.4)"} 
          style={{ zIndex: 10 }} 
        />
      </Pressable>
    </GestureDetector>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { bottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      {/* LiquidProvider aplica el efecto gooey entre la barra base y las gotas que jalamos */}
      <LiquidProvider>
        <LiquidGlass intensity={70} borderRadius={28} style={StyleSheet.absoluteFill} />
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const icons = ["play-circle", "search", "musical-notes", "person-circle"];
            
            const onPress = () => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <LiquidTabItem 
                key={route.key} 
                icon={icons[index]} 
                isFocused={isFocused} 
                onPress={onPress} 
              />
            );
          })}
        </View>
      </LiquidProvider>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute", left: 22, right: 22, height: 64, zIndex: 100,
  },
  tabBarInner: {
    flexDirection: "row", height: "100%", alignItems: "center", justifyContent: "space-around",
  },
  tabItem: {
    flex: 1, height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "transparent",
  },
  activeDrop: {
    position: "absolute", width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)",
  }
});
