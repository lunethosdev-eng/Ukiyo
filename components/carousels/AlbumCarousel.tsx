// components/carousels/AlbumCarousel.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LiquidGlassCard } from "@/components/liquid/LiquidGlassCard";
import { usePlayback } from "@/context/PlaybackContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.42;
const SPACING = 14;

interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
}

interface Props {
  title: string;
  data?: Album[];
}

const DEMO_DATA: Album[] = [
  {
    id: "1",
    title: "Midnight City",
    artist: "M83",
    artwork: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed849fde87625f",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    artwork: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Levitating",
    artist: "Dua Lipa",
    artwork: "https://i.scdn.co/image/ab67616d0000b273ef24c3fdbf856340d55cfeb2",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Album>);

export function AlbumCarousel({ title, data = DEMO_DATA }: Props) {
  const scrollX = useSharedValue(0);
  const { play } = usePlayback();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <AnimatedFlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <AlbumCard
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => play(item, data)}
          />
        )}
      />
    </View>
  );
}

function AlbumCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: Album;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const input = (index - 1) * (CARD_WIDTH + SPACING);
    const scale = interpolate(
      scrollX.value,
      [input - (CARD_WIDTH + SPACING), input, input + (CARD_WIDTH + SPACING)],
      [0.92, 1, 0.92],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View style={[{ width: CARD_WIDTH, marginRight: SPACING }, style]}>
      <Pressable onPress={onPress}>
        <LiquidGlassCard borderRadius={18} style={{ padding: 0 }}>
          <Image source={{ uri: item.artwork }} style={styles.artwork} />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
        </LiquidGlassCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 28 },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 20,
    marginBottom: 14,
  },
  artwork: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  info: { padding: 12 },
  title: { color: "#fff", fontWeight: "600", fontSize: 14 },
  artist: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 },
});
