'use client';

interface WaveformVisualizerProps {
  isRecording: boolean;
  className?: string;
}

export function WaveformVisualizer({ isRecording, className = '' }: WaveformVisualizerProps) {
  // Simple CSS-based waveform animation
  const bars = 5;

  return (
    <div className={`flex items-center justify-center h-12 gap-1.5 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full bg-primary transition-all duration-300
                     ${isRecording ? 'waveform-bar h-full' : 'h-2 opacity-30'}`}
        />
      ))}
    </div>
  );
}
