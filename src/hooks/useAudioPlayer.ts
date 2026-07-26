'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function useAudioPlayer(options?: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Lưu text tiếng Nga để dùng SpeechSynthesis
  const textRef = useRef<string>('');
  const urlRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  /**
   * Phát âm bằng SpeechSynthesis (giọng đọc trình duyệt)
   */
  const speakText = useCallback(async (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('SpeechSynthesis không được hỗ trợ');
      return;
    }

    // Cancel utterance cũ
    window.speechSynthesis.cancel();

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = playbackRate;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        options?.onEnded?.();
        resolve();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        resolve();
      };

      utteranceRef.current = utterance;
      setIsLoading(true);
      window.speechSynthesis.speak(utterance);
    });
  }, [playbackRate, options]);

  /**
   * Thử phát audio file, nếu thất bại thì fallback SpeechSynthesis
   */
  const playAudioUrl = useCallback(async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio();

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onReady);
        audio.removeEventListener('error', onError);
      };

      const onReady = async () => {
        cleanup();
        audioRef.current = audio;

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          options?.onEnded?.();
        });
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration || 0);
        });

        try {
          await audio.play();
          setIsPlaying(true);
          setIsLoading(false);
          setDuration(audio.duration || 0);
          resolve(true);
        } catch {
          resolve(false);
        }
      };

      const onError = () => {
        cleanup();
        resolve(false);
      };

      // Timeout: nếu sau 2s vẫn chưa load xong → fallback
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 2000);

      audio.addEventListener('canplaythrough', onReady);
      audio.addEventListener('error', onError);
      audio.playbackRate = playbackRate;
      audio.preload = 'auto';
      audio.src = url;
    });
  }, [playbackRate, options]);

  /**
   * Play chính: thử URL trước, fallback SpeechSynthesis
   * Hỗ trợ 2 cách gọi:
   *   play(url)            — phát URL (auto-extract text nếu là TTS URL)
   *   play(url, russianText) — phát URL, fallback bằng text chỉ định
   */
  const play = useCallback(async (url?: string, russianText?: string) => {
    if (url) {
      urlRef.current = url;
      // Extract text từ TTS URL nếu có (e.g. ...&q=Привет)
      if (russianText) {
        textRef.current = russianText;
      } else {
        try {
          const urlObj = new URL(url);
          textRef.current = urlObj.searchParams.get('q') || '';
        } catch {
          textRef.current = '';
        }
      }
    }

    setIsLoading(true);

    // Bước 1: Thử phát audio URL
    if (urlRef.current && !urlRef.current.includes('placeholder')) {
      const success = await playAudioUrl(urlRef.current);
      if (success) return;
    }

    // Bước 2: Fallback → SpeechSynthesis
    if (textRef.current) {
      await speakText(textRef.current);
    } else {
      setIsLoading(false);
      console.error('Không có audio URL hoặc text để phát');
    }
  }, [playAudioUrl, speakText]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setIsPlaying(false);
  }, []);

  const replay = useCallback(async () => {
    // Dừng tất cả
    audioRef.current?.pause();
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    setCurrentTime(0);

    // Phát lại
    await play();
  }, [play]);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
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
