// context/PlaybackContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Audio, AVPlaybackStatus } from "expo-av";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string;
  url: string;
  localUri?: string;
  colors?: string[];
  duration?: number;
}

interface PlaybackContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isOffline: boolean;
  position: number; // seconds
  duration: number;
  downloadedTracks: Track[];
  play: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>;
  sound: Audio.Sound | null;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Network status
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });
    return () => unsub();
  }, []);

  // Load offline library
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@ukiyo/downloaded");
        if (raw) setDownloadedTracks(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  // Status update loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && soundRef.current) {
      interval = setInterval(async () => {
        const status = await soundRef.current?.getStatusAsync();
        if (status?.isLoaded) {
          setPosition((status.positionMillis || 0) / 1000);
          setDuration((status.durationMillis || 0) / 1000);
        }
      }, 100); // 10fps for smooth karaoke
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const play = useCallback(
    async (track: Track) => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const source =
        isOffline && track.localUri
          ? { uri: track.localUri }
          : { uri: track.url };

      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        progressUpdateIntervalMillis: 100,
      });

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setPosition((status.positionMillis || 0) / 1000);
          setDuration((status.durationMillis || 0) / 1000);
        }
      });

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    [isOffline]
  );

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seconds * 1000);
      setPosition(seconds);
    }
  }, []);

  const downloadTrack = useCallback(
    async (track: Track) => {
      const dir = `${FileSystem.documentDirectory}music/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const localUri = `${dir}${track.id}.mp3`;

      const downloadResumable = FileSystem.createDownloadResumable(
        track.url,
        localUri
      );
      await downloadResumable.downloadAsync();

      const updated = [...downloadedTracks, { ...track, localUri }];
      setDownloadedTracks(updated);
      await AsyncStorage.setItem(
        "@ukiyo/downloaded",
        JSON.stringify(updated)
      );
    },
    [downloadedTracks]
  );

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isOffline,
        position,
        duration,
        downloadedTracks,
        play,
        pause,
        resume,
        seekTo,
        downloadTrack,
        sound: soundRef.current,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used within PlaybackProvider");
  return ctx;
};
