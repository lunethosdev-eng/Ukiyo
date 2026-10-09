import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  position: number;
  duration: number;
  downloadedTracks: Track[];
  queue: Track[];
  play: (track: Track, newQueue?: Track[]) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrev: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>;
  sound: Audio.Sound | null;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@ukiyo/downloaded");
        if (raw) setDownloadedTracks(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && soundRef.current) {
      interval = setInterval(async () => {
        const status = await soundRef.current?.getStatusAsync();
        if (status?.isLoaded) {
          setPosition((status.positionMillis || 0) / 1000);
          setDuration((status.durationMillis || 0) / 1000);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const play = useCallback(async (track: Track, newQueue?: Track[]) => {
    if (newQueue) setQueue(newQueue);
    else if (queue.length === 0) setQueue([track]);

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const source = isOffline && track.localUri ? { uri: track.localUri } : { uri: track.url };
    
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        progressUpdateIntervalMillis: 100,
      });

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setPosition((status.positionMillis || 0) / 1000);
          setDuration((status.durationMillis || 0) / 1000);
          if (status.didJustFinish) playNext();
        }
      });

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.warn("No se pudo reproducir la pista", error);
    }
  }, [isOffline, queue]);

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

  const togglePlay = useCallback(async () => {
    if (isPlaying) await pause();
    else await resume();
  }, [isPlaying, pause, resume]);

  const playNext = useCallback(async () => {
    if (!currentTrack || queue.length <= 1) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const nextTrack = queue[(currentIndex + 1) % queue.length];
    await play(nextTrack);
  }, [currentTrack, queue, play]);

  const playPrev = useCallback(async () => {
    if (!currentTrack || queue.length <= 1) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    await play(queue[prevIndex]);
  }, [currentTrack, queue, play]);

  const seekTo = useCallback(async (seconds: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seconds * 1000);
      setPosition(seconds);
    }
  }, []);

  const downloadTrack = useCallback(async (track: Track) => {
    const dir = `${FileSystem.documentDirectory}music/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const localUri = `${dir}${track.id}.mp3`;
    const downloadResumable = FileSystem.createDownloadResumable(track.url, localUri);
    await downloadResumable.downloadAsync();
    const updated = [...downloadedTracks, { ...track, localUri }];
    setDownloadedTracks(updated);
    await AsyncStorage.setItem("@ukiyo/downloaded", JSON.stringify(updated));
  }, [downloadedTracks]);

  return (
    <PlaybackContext.Provider
      value={{
        currentTrack, isPlaying, isOffline, position, duration, downloadedTracks, queue,
        play, pause, resume, togglePlay, playNext, playPrev, seekTo, downloadTrack, sound: soundRef.current,
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
