'use client';

import { useState } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { formatTime } from '@/lib/utils/scoring';

interface AudioPlayerProps {
  url: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  showControls?: boolean;
}

export function AudioPlayer({
  url,
  autoPlay = false,
  onEnded,
  showControls = true,
}: AudioPlayerProps) {
  const [hasStarted, setHasStarted] = useState(autoPlay);
  
  const {
    play,
    pause,
    replay,
    setSpeed,
    isPlaying,
    playbackRate,
    currentTime,
    duration,
  } = useAudioPlayer({
    onEnded,
  });

  // Handle initial play if autoPlay is true (may require user interaction in some browsers)
  // In a real app, we might need a "Start" button before autoPlay works.

  const handlePlayPause = () => {
    if (!hasStarted) {
      setHasStarted(true);
      play(url);
    } else if (isPlaying) {
      pause();
    } else {
      play(); // Resume
    }
  };

  const handleReplay = () => {
    replay();
  };

  const toggleSpeed = () => {
    setSpeed(playbackRate === 1 ? 0.75 : 1);
  };

  if (!showControls) {
    return (
      <button
        onClick={handlePlayPause}
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground
                   flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        aria-label={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
      >
        {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={handleReplay}
          disabled={!hasStarted}
          className="p-3 rounded-full bg-muted text-muted-foreground hover:bg-border transition-colors disabled:opacity-50"
          aria-label="Phát lại từ đầu"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={handlePlayPause}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground
                     flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={toggleSpeed}
          className={`p-3 rounded-full transition-colors flex items-center justify-center font-bold text-sm
            ${playbackRate === 1 
              ? 'bg-muted text-muted-foreground hover:bg-border' 
              : 'bg-primary-soft text-primary'}`}
          aria-label={`Tốc độ phát: ${playbackRate}x`}
        >
          {playbackRate}x
        </button>
      </div>

      <div className="w-full flex items-center gap-3 text-xs text-muted-foreground font-mono">
        <span>{formatTime(currentTime)}</span>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
