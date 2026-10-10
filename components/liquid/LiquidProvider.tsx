import React, { createContext, useContext } from "react";
import { View, StyleSheet } from "react-native";

const LiquidContext = createContext({ enabled: true });
export const useLiquid = () => useContext(LiquidContext);

export function LiquidProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  return (
    <LiquidContext.Provider value={{ enabled }}>
      <View style={StyleSheet.absoluteFill}>{children}</View>
    </LiquidContext.Provider>
  );
}
