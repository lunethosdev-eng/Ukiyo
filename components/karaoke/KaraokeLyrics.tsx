// components/karaoke/KaraokeLyrics.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import { usePlayback } from "@/context/PlaybackContext";
import { fetchLyrics, LyricLine } from "@/services/lyricsService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPEED_FACTOR = 1.2; // 1.2x coloring speed as requested

interface CharState {
  char: string;
  isActive: boolean;
  isPast: boolean;
}

/**
 * Karaoke screen:
 * - Full-screen blurred album cover background
 * - Letter-by-letter coloring at 1.2x speed
 * - Smooth spring / timing animations
 */
export function KaraokeLyrics() {
  const { currentTrack, position, isPlaying } = usePlayback();
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);

  // Load lyrics when track changes
  useEffect(() => {
    if (!currentTrack) return;
    (async () => {
      const data = await fetchLyrics(
        currentTrack.title,
        currentTrack.artist,
        currentTrack.album,
        currentTrack.duration
      );
      if (data?.lines?.length) {
        setLines(data.lines);
      } else if (currentTrack.lyricsText) {
        // Accept plain text lyrics returned by /api/search as a useful fallback.
        const fallback = currentTrack.lyricsText
          .split(/\\r?\\n/)
          .map((text) => text.trim())
          .filter(Boolean)
          .map((text, index) => ({ time: index * 4, text }));
        setLines(fallback);
      } else {
        setLines([]);
      }
    })();
  }, [currentTrack?.id]);

  // Find current line based on position * SPEED_FACTOR
  useEffect(() => {
    if (!lines.length) return;
    const adjustedPos = position * SPEED_FACTOR;
    let idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= adjustedPos) idx = i;
      else break;
    }
    setActiveLineIndex(idx);
  }, [position, lines]);

  if (!currentTrack) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No track playing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Blurred full-screen cover */}
      <ImageBackground
        source={{ uri: currentTrack.artwork }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.darkOverlay} />
      </ImageBackground>

      {/* Lyrics */}
      <ScrollView
        contentContainerStyle={styles.lyricsContainer}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, index) => (
          <KaraokeLine
            key={`${line.time}-${index}`}
            text={line.text}
            isActive={index === activeLineIndex}
            isPast={index < activeLineIndex}
            lineStartTime={line.time}
            nextLineTime={lines[index + 1]?.time ?? line.time + 4}
            currentPosition={position * SPEED_FACTOR}
          />
        ))}
        {lines.length === 0 && (
          <Text style={styles.noLyrics}>Lyrics not available</Text>
        )}
      </ScrollView>
    </View>
  );
}

/** Single line with letter-by-letter coloring */
function KaraokeLine({
  text,
  isActive,
  isPast,
  lineStartTime,
  nextLineTime,
  currentPosition,
}: {
  text: string;
  isActive: boolean;
  isPast: boolean;
  lineStartTime: number;
  nextLineTime: number;
  currentPosition: number;
}) {
  const chars = text.split("");
  const lineDuration = Math.max(nextLineTime - lineStartTime, 0.8);
  const progressInLine = isActive
    ? Math.min(
        Math.max((currentPosition - lineStartTime) / lineDuration, 0),
        1
      )
    : isPast
    ? 1
    : 0;

  // How many characters should be colored
  const activeCharCount = Math.floor(progressInLine * chars.length);

  return (
    <View style={styles.lineWrapper}>
      <Text style={styles.line}>
        {chars.map((char, i) => {
          const isColored = i < activeCharCount || isPast;
          return (
            <AnimatedChar
              key={i}
              char={char}
              isColored={isColored}
              isActiveLine={isActive}
            />
          );
        })}
      </Text>
    </View>
  );
}

/** Individual character with smooth color transition */
function AnimatedChar({
  char,
  isColored,
  isActiveLine,
}: {
  char: string;
  isColored: boolean;
  isActiveLine: boolean;
}) {
  const progress = useSharedValue(isColored ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isColored ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [isColored]);

  const animatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(255,255,255,0.35)", "#FFFFFF"]
    );
    return {
      color,
      opacity: isActiveLine ? 1 : 0.55,
      transform: [
        {
          scale: withTiming(isColored && isActiveLine ? 1.05 : 1, {
            duration: 160,
          }),
        },
      ],
    };
  });

  return <Animated.Text style={[styles.char, animatedStyle]}>{char}</Animated.Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  lyricsContainer: {
    paddingHorizontal: 28,
    paddingTop: SCREEN_HEIGHT * 0.28,
    paddingBottom: 160,
    alignItems: "center",
  },
  lineWrapper: {
    marginVertical: 14,
    maxWidth: SCREEN_WIDTH - 56,
  },
  line: {
    textAlign: "center",
    flexWrap: "wrap",
  },
  char: {
    fontSize: 26,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  noLyrics: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 18,
    marginTop: 40,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0618",
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
  },
});
