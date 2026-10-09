// components/liquid/LiquidProvider.tsx
import React, { createContext, useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Blur, ColorMatrix, Group } from "@shopify/react-native-skia";

const LiquidContext = createContext({ enabled: true });

export const useLiquid = () => useContext(LiquidContext);

interface Props {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Global Gooey / Liquid effect using Skia ColorMatrix threshold.
 * Wrap the entire app (or specific sections) to make interacting shapes merge like liquid.
 */
export function LiquidProvider({ children, enabled = true }: Props) {
  // Alpha threshold matrix → classic gooey look
  const gooeyMatrix = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 18, -7,
  ];

  return (
    <LiquidContext.Provider value={{ enabled }}>
      <View style={StyleSheet.absoluteFill}>
        {enabled && (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Group>
              <Blur blur={12} />
              <ColorMatrix matrix={gooeyMatrix} />
            </Group>
          </Canvas>
        )}
        {children}
      </View>
    </LiquidContext.Provider>
  );
}
