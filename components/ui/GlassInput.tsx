// components/ui/GlassInput.tsx
import React from "react";
import { TextInput, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
}

export function GlassInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  style,
  autoCapitalize = "none",
  keyboardType = "default",
}: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 54,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 18,
    color: "#fff",
    fontSize: 16,
  },
});
