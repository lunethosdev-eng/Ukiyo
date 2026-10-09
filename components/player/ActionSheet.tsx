import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: H } = Dimensions.get("window");

interface ActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  track: { title: string; artist: string; artwork: string } | null;
}

export function ActionSheet({ isVisible, onClose, track }: ActionSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(H);
  const opacity = useSharedValue(0);

  // Animar entrada y salida
  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withSpring(H, { damping: 18, stiffness: 200 });
    }
  }, [isVisible]);

  // Gestos para arrastrar y cerrar
  const pan = Gesture.Pan()
    .onChange((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        translateY.value = withSpring(H, { damping: 18, stiffness: 200 }, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: isVisible ? "auto" : "none",
  }));

  if (!track && isVisible) return null;

  return (
    <>
      {/* Fondo oscuro al abrir el menú */}
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Contenedor del menú arrastrable */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheetContainer,
            animatedSheetStyle,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <LiquidGlass intensity={70} borderRadius={28} style={StyleSheet.absoluteFill} />

          {/* Indicador de arrastre */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Cabecera de la canción */}
          <View style={styles.header}>
            <Image source={{ uri: track?.artwork }} style={styles.headerArt} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {track?.title}
              </Text>
              <Text style={styles.headerArtist} numberOfLines={1}>
                {track?.artist}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Lista de Opciones */}
          <View style={styles.optionsList}>
            <ActionItem 
              icon="add-circle-outline" 
              label="Agregar a Playlist" 
              onPress={() => { alert("Agregado a playlist"); onClose(); }} 
            />
            <ActionItem 
              icon="arrow-down-circle-outline" 
              label="Descargar" 
              onPress={() => { alert("Descargando..."); onClose(); }} 
            />
            <ActionItem 
              icon="share-outline" 
              label="Compartir" 
              onPress={() => { alert("Abriendo opciones de compartir"); onClose(); }} 
            />
            <ActionItem 
              icon="person-circle-outline" 
              label="Ver Artista" 
              onPress={() => { alert("Navegando al artista"); onClose(); }} 
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

// Componente individual para cada opción del menú
function ActionItem({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionItem, pressed && styles.actionItemPressed]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color="#fff" style={styles.actionIcon} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    zIndex: 101,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#2c2c2e",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerArtist: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  optionsList: {
    paddingHorizontal: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  actionItemPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  actionIcon: {
    marginRight: 16,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },
});
