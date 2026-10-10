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

// Carga segura de TrackPlayer: si el nativo no está disponible, no crashea la app.
let TrackPlayer: any = null;
let Capability: any = {};
let State: any = {};
let Event: any = {};
let useProgress: any = () => ({ position: 0, duration: 0 });
let useTrackPlayerEvents: any = () => {};
let TP_AVAILABLE = false;

try {
  const tp = require('react-native-track-player');
  TrackPlayer = tp.default;
  Capability = tp.Capability;
  State = tp.State;
  Event = tp.Event;
  useProgress = tp.useProgress;
  useTrackPlayerEvents = tp.useTrackPlayerEvents;
  TP_AVAILABLE = true;
} catch (e) {
  console.warn('[Ukiyo] react-native-track-player no disponible:', e);
}

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
  const queueRef = useRef<Track[]>([]);
  const currentRef = useRef<Track | null>(null);
  const { position, duration } = useProgress(500);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (TP_AVAILABLE && TrackPlayer) {
        try {
          await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
        } catch (e: any) {
          if (!String(e?.message ?? e).includes('already been initialized')) {
            console.warn('TrackPlayer setupPlayer:', e);
          }
        }
        try {
          await TrackPlayer.updateOptions({
            android: { appKilledPlaybackBehavior: 'ContinuePlayback' as any },
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.SeekTo,
            ],
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
            ],
            notificationCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
            ],
            progressUpdateEventInterval: 1,
          });
        } catch (e) {
          console.warn('TrackPlayer updateOptions:', e);
        }
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
    };
  }, []);

  useTrackPlayerEvents(
    TP_AVAILABLE
      ? [Event.PlaybackState, Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded]
      : [],
    async (event: any) => {
      if (!TP_AVAILABLE) return;
      if (event.type === Event.PlaybackState) {
        setIsPlaying(
          event.state === State.Playing ||
            event.state === State.Buffering ||
            event.state === State.Loading
        );
      }
      if (event.type === Event.PlaybackActiveTrackChanged) {
        const index = event.index;
        if (typeof index === 'number' && queueRef.current[index]) {
          currentRef.current = queueRef.current[index];
          setCurrentTrack(queueRef.current[index]);
        }
      }
      if (event.type === Event.PlaybackQueueEnded) setIsPlaying(false);
    }
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
      queueRef.current = normalized;
      setQueue(normalized);
      currentRef.current = track;
      setCurrentTrack(track);

      if (!TP_AVAILABLE || !TrackPlayer) {
        console.warn('[Ukiyo] TrackPlayer no disponible — no se puede reproducir');
        return;
      }

      try {
        await TrackPlayer.reset();
        await TrackPlayer.add(
          normalized.map((t) => ({
            id: t.id,
            url: isOffline && t.localUri ? t.localUri : t.url,
            title: t.title,
            artist: t.artist,
            album: t.album,
            artwork: t.artwork,
            duration: t.duration,
          }))
        );
        await TrackPlayer.skip(normalized.findIndex((t) => t.id === track.id));
        await TrackPlayer.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('No se pudo reproducir la pista', e);
        setIsPlaying(false);
      }
    },
    [isOffline]
  );

  const pause = useCallback(async () => {
    if (TP_AVAILABLE && TrackPlayer) {
      try {
        await TrackPlayer.pause();
      } catch {}
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(async () => {
    if (TP_AVAILABLE && TrackPlayer) {
      try {
        await TrackPlayer.play();
        setIsPlaying(true);
      } catch {}
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) await pause();
    else await resume();
  }, [isPlaying, pause, resume]);

  const playNext = useCallback(async () => {
    if (!TP_AVAILABLE || !TrackPlayer) return;
    try {
      await TrackPlayer.skipToNext();
      await TrackPlayer.play();
    } catch {}
  }, []);

  const playPrev = useCallback(async () => {
    if (!TP_AVAILABLE || !TrackPlayer) return;
    try {
      if (position > 3) await TrackPlayer.seekTo(0);
      else await TrackPlayer.skipToPrevious();
      await TrackPlayer.play();
    } catch {}
  }, [position]);

  const seekTo = useCallback(async (seconds: number) => {
    if (!TP_AVAILABLE || !TrackPlayer) return;
    try {
      await TrackPlayer.seekTo(Math.max(0, seconds));
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
