'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function useAudioPlayer(options?: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const load = useCallback(
    (url: string) => {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      audio.preload = 'auto';

      audio.addEventListener('loadstart', () => setIsLoading(true));
      audio.addEventListener('canplaythrough', () => setIsLoading(false));
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        options?.onEnded?.();
      });
      audio.addEventListener('error', () => {
        setIsPlaying(false);
        setIsLoading(false);
      });
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
        options?.onTimeUpdate?.(audio.currentTime, audio.duration || 0);
      });
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });

      audioRef.current = audio;
    },
    [playbackRate, options]
  );

  const play = useCallback(
    async (url?: string) => {
      if (url) load(url);
      if (!audioRef.current) return;

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Audio playback failed:', err);
        setIsPlaying(false);
      }
    },
    [load]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const replay = useCallback(async () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Audio replay failed:', err);
    }
  }, []);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  return {
    play,
    pause,
    replay,
    stop,
    setSpeed,
    isPlaying,
    isLoading,
    playbackRate,
    currentTime,
    duration,
  };
}
