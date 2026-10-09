import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Canvas, Group, Paint, Blur, ColorMatrix, RoundedRect, Circle, Mask, Rect, LinearGradient, vec } from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");

// Matriz para efecto Gooey (Líquido)
const GOOEY_MATRIX = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 20, -10, // Umbral de fusión de alpha
];

function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 68;
  const BAR_MARGIN = 22;
  const BAR_WIDTH = width - BAR_MARGIN * 2;
  
  // Físicas del líquido
  const touchX = useSharedValue(width / 2);
  const touchY = useSharedValue(TAB_HEIGHT / 2);
  const dropRadius = useSharedValue(0);

  const handleTabPress = (index: number) => {
    const route = state.routes[index];
    const isFocused = state.index === index;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      touchX.value = e.x;
      touchY.value = e.y;
      // La gota sale y se estira
      dropRadius.value = withSpring(32, { damping: 12, stiffness: 220 });
    })
    .onUpdate((e) => {
      touchX.value = e.x;
      touchY.value = e.y;
    })
    .onEnd((e) => {
      // Efecto bounce back super realista de Apple
      dropRadius.value = withSpring(0, { damping: 14, stiffness: 250 });
      // Detectar toque simple vs arrastre
      if (Math.abs(e.translationX) < 15 && Math.abs(e.translationY) < 15) {
        const tabWidth = width / state.routes.length;
        const index = Math.floor(e.absoluteX / tabWidth);
        if (index >= 0 && index < state.routes.length) {
          runOnJS(handleTabPress)(index);
        }
      }
    });

  return (
    <View style={[styles.tabContainer, { bottom: Math.max(insets.bottom, 10) }]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.gestureArea}>
          
          {/* SKIA CANVAS: El verdadero Liquid Glass Effect */}
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Mask
              mask={
                <Group layer={<Paint><Blur blur={12} /><ColorMatrix matrix={GOOEY_MATRIX} /></Paint>}>
                  {/* Cuerpo principal que se queda en su puesto */}
                  <RoundedRect x={BAR_MARGIN} y={0} width={BAR_WIDTH} height={TAB_HEIGHT} r={28} color="white" />
                  {/* Gota que sigue el dedo */}
                  <Circle cx={touchX} cy={touchY} r={dropRadius} color="white" />
                </Group>
              }
            >
              {/* Textura de cristal aplicada SOLO a la forma deformada */}
              <Rect x={0} y={-50} width={width} height={TAB_HEIGHT + 100}>
                <LinearGradient
                  start={vec(0, 0)} end={vec(width, TAB_HEIGHT)}
                  colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)"]}
                />
              </Rect>
            </Mask>
          </Canvas>

          {/* Iconos de los Tabs */}
          <View style={styles.iconRow} pointerEvents="none">
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const { options } = descriptors[route.key];
              
              let iconName = "play-circle";
              if (route.name === "search") iconName = "search";
              if (route.name === "library") iconName = "musical-notes";
              if (route.name === "profile") iconName = "person-circle";

              return (
                <View key={route.key} style={styles.tabItem}>
                  <Ionicons 
                    name={iconName as any} 
                    size={26} 
                    color={isFocused ? "#fff" : "rgba(255,255,255,0.4)"} 
                  />
                  <Animated.Text style={[styles.tabLabel, { color: isFocused ? "#fff" : "rgba(255,255,255,0.4)" }]}>
                    {options.title}
                  </Animated.Text>
                </View>
              );
            })}
          </View>
          
        </View>
      </GestureDetector>
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
  tabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 68,
    zIndex: 100,
  },
  gestureArea: {
    flex: 1,
    width: "100%",
  },
  iconRow: {
    flexDirection: "row",
    height: 68,
    marginHorizontal: 22,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },
});
