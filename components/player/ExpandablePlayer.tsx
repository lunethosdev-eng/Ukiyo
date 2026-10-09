import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Dimensions, ImageBackground, ScrollView } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolation, runOnJS } from "react-native-reanimated";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { usePlayback } from "@/context/PlaybackContext";
import { LiquidGlass } from "@/components/liquid/LiquidGlass";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionSheet } from "./ActionSheet";

const { height: H, width: W } = Dimensions.get("window");
const MINI_H = 68;
const TAB_CLEARANCE = 78;

export function ExpandablePlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrev, position, duration } = usePlayback();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname(); // <- Clave para ocultarlo en Karaoke
  
  const expand = useSharedValue(0);
  const start = useSharedValue(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const openKaraoke = useCallback(() => {
    router.push("/player/karaoke");
  }, [router]);

  const collapsePlayer = useCallback(() => {
    setIsExpanded(false);
    expand.value = withSpring(0, { damping: 16, stiffness: 200 });
  }, [expand]);

  const pan = Gesture.Pan()
    .enabled(!isExpanded)
    .onStart(() => {
      start.value = expand.value;
    })
    .onUpdate((e) => {
      const next = start.value - e.translationY / (H * 0.75);
      expand.value = next; 
    })
    .onEnd((e) => {
      const shouldOpen = e.velocityY < -400 || expand.value > 0.35;
      runOnJS(setIsExpanded)(shouldOpen);
      expand.value = withSpring(shouldOpen ? 1 : 0, {
        damping: 12,       // Apple Music physics tuning
        stiffness: 220,    
        mass: 0.8,
        overshootClamping: false,
      });
    });

  const sheetStyle = useAnimatedStyle(() => {
    const isOverScrolled = expand.value > 1;
    const isUnderScrolled = expand.value < 0;
    
    const scaleY = isOverScrolled 
      ? 1 + (expand.value - 1) * 0.15 
      : (isUnderScrolled ? 1 + Math.abs(expand.value) * 0.15 : 1);

    const bottom = interpolate(expand.value, [0, 1], [TAB_CLEARANCE + insets.bottom, 0], Extrapolation.CLAMP);
    const h = interpolate(expand.value, [0, 1], [MINI_H, H], Extrapolation.CLAMP);
    const radius = interpolate(expand.value, [0, 1], [24, 0], Extrapolation.CLAMP);
    const mx = interpolate(expand.value, [0, 1], [12, 0], Extrapolation.CLAMP);

    return {
      position: "absolute",
      left: mx, right: mx, bottom, height: h,
      borderRadius: radius,
      overflow: "hidden",
      zIndex: 50,
      transform: [
        { scaleY }, 
        { translateY: isOverScrolled ? (expand.value - 1) * 30 : 0 }
      ],
    };
  });

  const miniStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expand.value, [0, 0.15], [1, 0], Extrapolation.CLAMP),
    display: expand.value > 0.2 ? 'none' : 'flex'
  }));
  
  const fullStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expand.value, [0.4, 0.8], [0, 1], Extrapolation.CLAMP),
    display: expand.value < 0.3 ? 'none' : 'flex'
  }));

  // SI estamos en Karaoke, desaparecemos por completo de la UI para que las letras funcionen
  if (!currentTrack || pathname === "/player/karaoke") return null;
  const progress = duration > 0 ? position / duration : 0;

  return (
    <>
      <GestureDetector gesture={pan}>
        <Animated.View style={sheetStyle}>
          
          <Animated.View style={[StyleSheet.absoluteFill, fullStyle]}>
            <ImageBackground source={{ uri: currentTrack.artwork }} style={StyleSheet.absoluteFill}>
              <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }} />
            </ImageBackground>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, miniStyle]}>
            <LiquidGlass intensity={60} borderRadius={24} style={StyleSheet.absoluteFill} />
          </Animated.View>

          <Animated.View style={[styles.mini, miniStyle]} pointerEvents="box-none">
            <Image source={{ uri: currentTrack.artwork }} style={styles.miniArt} />
            <View style={styles.miniMeta}>
              <Text style={styles.miniTitle} numberOfLines={1}>{currentTrack.title}</Text>
            </View>
            <Pressable onPress={togglePlay} hitSlop={12} style={styles.miniPlayBtn}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#000" />
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.full, fullStyle]} pointerEvents="box-none">
            <View style={styles.topBar}>
               <Pressable onPress={collapsePlayer} hitSlop={12}><Ionicons name="chevron-down" size={28} color="rgba(255,255,255,0.8)" /></Pressable>
               <View style={styles.handle} />
               <Pressable onPress={() => setShowOptions(true)} hitSlop={12}>
                 <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
               </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.coverContainer}>
                <Image source={{ uri: currentTrack.artwork }} style={styles.fullArt} />
              </View>

              <View style={styles.infoRow}>
                <View style={styles.titleArea}>
                  <Text style={styles.fullTitle} numberOfLines={2}>{currentTrack.title}</Text>
                  <Text style={styles.fullArtist}>{currentTrack.artist}</Text>
                </View>
                <Pressable style={[styles.followBtn, isFollowing && styles.followingBtn]} onPress={() => setIsFollowing(!isFollowing)}>
                  <Text style={styles.followText}>{isFollowing ? "Siguiendo" : "Seguir"}</Text>
                </Pressable>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
              </View>

              {/* Controles de reproducción fijos */}
              <View style={styles.controls}>
                <Pressable onPress={playPrev} hitSlop={16}>
                  <Ionicons name="play-back" size={36} color="#fff" />
                </Pressable>
                
                <Pressable onPress={togglePlay} style={styles.playBtn}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#0c0c0e" />
                </Pressable>
                
                <Pressable onPress={playNext} hitSlop={16}>
                  <Ionicons name="play-forward" size={36} color="#fff" />
                </Pressable>
              </View>

              <Pressable onPress={openKaraoke} style={{ marginTop: 40, marginBottom: 60 }}>
                <LiquidGlass intensity={30} borderRadius={20} style={styles.lyricsBox}>
                  <View style={styles.lyricsHeader}>
                    <Text style={styles.lyricsTitle}>Letras</Text>
                    <Ionicons name="expand" size={18} color="rgba(255,255,255,0.6)" />
                  </View>
                  <Text style={styles.lyricsPreview}>
                    Toca aquí para ver las letras sincronizadas en pantalla completa...
                  </Text>
                </LiquidGlass>
              </Pressable>
            </ScrollView>
          </Animated.View>

        </Animated.View>
      </GestureDetector>

      <ActionSheet isVisible={showOptions} onClose={() => setShowOptions(false)} track={currentTrack} />
    </>
  );
}

const styles = StyleSheet.create({
  mini: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: MINI_H, gap: 12 },
  miniArt: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#1c1c1e" },
  miniMeta: { flex: 1 },
  miniTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  miniPlayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  
  full: { ...StyleSheet.absoluteFillObject, paddingTop: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  
  scrollContent: { paddingHorizontal: 28, paddingBottom: 60 },
  coverContainer: { width: "100%", aspectRatio: 1, marginTop: 10, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 24 },
  fullArt: { width: "100%", height: "100%", borderRadius: 16, backgroundColor: "#1c1c1e" },
  
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  titleArea: { flex: 1, paddingRight: 16 },
  fullTitle: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  fullArtist: { color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: "500", marginTop: 4 },
  
  followBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  followingBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "transparent" },
  followText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  
  barTrack: { width: "100%", height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "#fff", borderRadius: 3 },
  
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 40, marginTop: 40 },
  playBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  
  lyricsBox: { width: "100%", padding: 20 },
  lyricsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  lyricsTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  lyricsPreview: { color: "rgba(255,255,255,0.7)", fontSize: 20, fontWeight: "600", lineHeight: 28 },
});
