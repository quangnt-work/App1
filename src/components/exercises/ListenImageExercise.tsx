'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AudioPlayer } from '../audio/AudioPlayer';
import type { AudioPhrase, ListenImageData } from '@/lib/types/database';

interface ListenImageExerciseProps {
  phrase: AudioPhrase;
  questionData: ListenImageData;
  onComplete: (isCorrect: boolean) => void;
}

export function ListenImageExercise({ phrase, questionData, onComplete }: ListenImageExerciseProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedIdx(idx);
    setHasAnswered(true);
    
    setTimeout(() => {
      onComplete(idx === questionData.correct_index);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold mb-6">Nghe và chọn hình ảnh phù hợp</h2>
        <AudioPlayer url={phrase.audio_url} autoPlay showControls={false} />
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        {questionData.options.map((option, idx) => {
          let stateClass = 'bg-card border-border hover:border-primary/50 hover:shadow-md';
          
          if (hasAnswered) {
            if (idx === questionData.correct_index) {
              stateClass = 'bg-success-soft border-success ring-2 ring-success/20';
            } else if (idx === selectedIdx) {
              stateClass = 'bg-danger-soft border-danger opacity-50 grayscale';
            } else {
              stateClass = 'bg-card border-border opacity-50';
            }
          }

          return (
            <button
              key={idx}
              disabled={hasAnswered}
              onClick={() => handleSelect(idx)}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all aspect-square flex flex-col ${stateClass}`}
            >
              <div className="relative flex-1 w-full bg-muted/30">
                {/* Fallback pattern if no valid image URL */}
                {option.image_url.startsWith('http') || option.image_url.startsWith('/') ? (
                  <Image 
                    src={option.image_url} 
                    alt={option.label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    🖼️
                  </div>
                )}
              </div>
              <div className="p-3 text-center border-t border-border/50 bg-card/50 backdrop-blur-sm font-medium">
                {option.label}
              </div>
            </button>
          );
        })}
      </div>
      
      {hasAnswered && (
        <div className="mt-8 text-center animate-fade-in-up">
          <p className="text-lg font-bold mb-1">{phrase.russian_word || phrase.russian_text}</p>
          <p className="text-muted-foreground">{phrase.translation}</p>
        </div>
      )}
    </div>
  );
}
