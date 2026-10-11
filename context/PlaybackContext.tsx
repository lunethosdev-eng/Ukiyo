import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Audio, AVPlaybackStatus } from 'expo-av';

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
  lyricsText?: string;
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
  sound: null;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const queueRef = useRef<Track[]>([]);
  const currentRef = useRef<Track | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          // Controles nativos limitados con expo-av; audio sigue en background
        } as any);
      } catch (e) {
        console.warn('Audio.setAudioModeAsync:', e);
      }

      try {
        const raw = await AsyncStorage.getItem('@ukiyo/downloaded');
        if (raw && mounted) setDownloadedTracks(JSON.parse(raw));
      } catch {}
    })();

    const net = NetInfo.addEventListener((s) =>
      setIsOffline(!(s.isConnected && s.isInternetReachable))
    );

    return () => {
      mounted = false;
      net();
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const onStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) console.warn('Playback error:', status.error);
      return;
    }
    setPosition(status.positionMillis / 1000);
    setDuration((status.durationMillis ?? 0) / 1000);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish && !status.isLooping) {
      const next = indexRef.current + 1;
      if (next < queueRef.current.length) {
        const track = queueRef.current[next];
        indexRef.current = next;
        currentRef.current = track;
        setCurrentTrack(track);
        loadAndPlay(track).catch(() => {});
      } else {
        setIsPlaying(false);
      }
    }
  }, []);

  const loadAndPlay = useCallback(
    async (track: Track) => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const uri = isOffline && track.localUri ? track.localUri : track.url;
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, progressUpdateIntervalMillis: 500 },
          onStatusUpdate
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } catch (e) {
        console.warn('No se pudo reproducir la pista', e);
        setIsPlaying(false);
      }
    },
    [isOffline, onStatusUpdate]
  );

  const play = useCallback(
    async (track: Track, newQueue?: Track[]) => {
      const nextQueue = newQueue?.length
        ? newQueue
        : queueRef.current.length
          ? queueRef.current
          : [track];
      const found = nextQueue.findIndex((t) => t.id === track.id);
      const normalized = found < 0 ? [...nextQueue, track] : nextQueue;
      const idx = normalized.findIndex((t) => t.id === track.id);

      queueRef.current = normalized;
      setQueue(normalized);
      indexRef.current = idx >= 0 ? idx : 0;
      currentRef.current = track;
      setCurrentTrack(track);

      await loadAndPlay(track);
    },
    [loadAndPlay]
  );

  const pause = useCallback(async () => {
    try {
      await soundRef.current?.pauseAsync();
    } catch {}
    setIsPlaying(false);
  }, []);

  const resume = useCallback(async () => {
    try {
      await soundRef.current?.playAsync();
      setIsPlaying(true);
    } catch {}
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) await pause();
    else await resume();
  }, [isPlaying, pause, resume]);

  const playNext = useCallback(async () => {
    const next = indexRef.current + 1;
    if (next >= queueRef.current.length) return;
    const track = queueRef.current[next];
    indexRef.current = next;
    currentRef.current = track;
    setCurrentTrack(track);
    await loadAndPlay(track);
  }, [loadAndPlay]);

  const playPrev = useCallback(async () => {
    if (position > 3) {
      try {
        await soundRef.current?.setPositionAsync(0);
      } catch {}
      return;
    }
    const prev = indexRef.current - 1;
    if (prev < 0) return;
    const track = queueRef.current[prev];
    indexRef.current = prev;
    currentRef.current = track;
    setCurrentTrack(track);
    await loadAndPlay(track);
  }, [position, loadAndPlay]);

  const seekTo = useCallback(async (seconds: number) => {
    try {
      await soundRef.current?.setPositionAsync(Math.max(0, seconds) * 1000);
    } catch {}
  }, []);

  const downloadTrack = useCallback(
    async (track: Track) => {
      const dir = `${FileSystem.documentDirectory}music/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const localUri = `${dir}${track.id}.mp3`;
      await FileSystem.downloadAsync(track.url, localUri);
      const updated = [
        ...downloadedTracks.filter((t) => t.id !== track.id),
        { ...track, localUri },
      ];
      setDownloadedTracks(updated);
      await AsyncStorage.setItem('@ukiyo/downloaded', JSON.stringify(updated));
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
        queue,
        play,
        pause,
        resume,
        togglePlay,
        playNext,
        playPrev,
        seekTo,
        downloadTrack,
        sound: null,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
};
