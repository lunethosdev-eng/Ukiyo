import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import TrackPlayer, { Capability, State, useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player';

export interface Track {
  id: string; title: string; artist: string; album?: string; artwork: string; url: string;
  localUri?: string; colors?: string[]; duration?: number; lyricsText?: string;
}
interface PlaybackContextType {
  currentTrack: Track | null; isPlaying: boolean; isOffline: boolean; position: number; duration: number;
  downloadedTracks: Track[]; queue: Track[]; play: (track: Track, newQueue?: Track[]) => Promise<void>;
  pause: () => Promise<void>; resume: () => Promise<void>; togglePlay: () => Promise<void>;
  playNext: () => Promise<void>; playPrev: () => Promise<void>; seekTo: (seconds: number) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>; sound: null;
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
      try {
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
        await TrackPlayer.updateOptions({
          android: { appKilledPlaybackBehavior: 'continue-playback' },
          capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.SeekTo],
          compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
          notificationCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
          progressUpdateEventInterval: 1,
        });
      } catch (e) { console.warn('TrackPlayer setup:', e); }
      try { const raw = await AsyncStorage.getItem('@ukiyo/downloaded'); if (raw && mounted) setDownloadedTracks(JSON.parse(raw)); } catch {}
    })();
    const net = NetInfo.addEventListener(s => setIsOffline(!(s.isConnected && s.isInternetReachable)));
    return () => { mounted = false; net(); };
  }, []);

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded], async event => {
    if (event.type === Event.PlaybackState) {
      setIsPlaying(event.state === State.Playing || event.state === State.Buffering || event.state === State.Loading);
    }
    if (event.type === Event.PlaybackActiveTrackChanged) {
      const index = event.index;
      if (typeof index === 'number' && queueRef.current[index]) {
        currentRef.current = queueRef.current[index]; setCurrentTrack(queueRef.current[index]);
      }
    }
    if (event.type === Event.PlaybackQueueEnded) setIsPlaying(false);
  });

  const play = useCallback(async (track: Track, newQueue?: Track[]) => {
    const nextQueue = newQueue?.length ? newQueue : (queueRef.current.length ? queueRef.current : [track]);
    const found = nextQueue.findIndex(t => t.id === track.id);
    const normalized = found < 0 ? [...nextQueue, track] : nextQueue;
    queueRef.current = normalized; setQueue(normalized);
    currentRef.current = track; setCurrentTrack(track);
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(normalized.map(t => ({
        id: t.id, url: isOffline && t.localUri ? t.localUri : t.url,
        title: t.title, artist: t.artist, album: t.album, artwork: t.artwork,
        duration: t.duration,
      })));
      await TrackPlayer.skip(normalized.findIndex(t => t.id === track.id));
      await TrackPlayer.play(); setIsPlaying(true);
    } catch (e) { console.warn('No se pudo reproducir la pista', e); setIsPlaying(false); }
  }, [isOffline]);
  const pause = useCallback(async () => { await TrackPlayer.pause(); setIsPlaying(false); }, []);
  const resume = useCallback(async () => { await TrackPlayer.play(); setIsPlaying(true); }, []);
  const togglePlay = useCallback(async () => { if (isPlaying) await pause(); else await resume(); }, [isPlaying, pause, resume]);
  const playNext = useCallback(async () => { try { await TrackPlayer.skipToNext(); await TrackPlayer.play(); } catch {} }, []);
  const playPrev = useCallback(async () => {
    try { if (position > 3) await TrackPlayer.seekTo(0); else await TrackPlayer.skipToPrevious(); await TrackPlayer.play(); } catch {}
  }, [position]);
  const seekTo = useCallback(async (seconds: number) => { await TrackPlayer.seekTo(Math.max(0, seconds)); }, []);
  const downloadTrack = useCallback(async (track: Track) => {
    const dir = `${FileSystem.documentDirectory}music/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const localUri = `${dir}${track.id}.mp3`;
    await FileSystem.downloadAsync(track.url, localUri);
    const updated = [...downloadedTracks.filter(t => t.id !== track.id), { ...track, localUri }];
    setDownloadedTracks(updated); await AsyncStorage.setItem('@ukiyo/downloaded', JSON.stringify(updated));
  }, [downloadedTracks]);
  return <PlaybackContext.Provider value={{ currentTrack, isPlaying, isOffline, position, duration, downloadedTracks, queue, play, pause, resume, togglePlay, playNext, playPrev, seekTo, downloadTrack, sound: null }}>{children}</PlaybackContext.Provider>;
}
export const usePlayback = () => { const ctx = useContext(PlaybackContext); if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider'); return ctx; };
