'use client';

import { useState } from 'react';
import { AudioPlayer } from '../audio/AudioPlayer';
import type { AudioPhrase, ListenChooseData } from '@/lib/types/database';

interface ListenChooseExerciseProps {
  phrase: AudioPhrase;
  questionData: ListenChooseData;
  onComplete: (isCorrect: boolean) => void;
}

export function ListenChooseExercise({ phrase, questionData, onComplete }: ListenChooseExerciseProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const isCorrect = selectedIdx === questionData.correct_index;

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedIdx(idx);
    setHasAnswered(true);
    
    // Auto-advance after 1.5s if correct
    setTimeout(() => {
      onComplete(idx === questionData.correct_index);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto w-full flex flex-col items-center animate-fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-xl font-bold mb-6">Nghe và chọn đáp án đúng</h2>
        <AudioPlayer url={phrase.audio_url} russianText={phrase.russian_text} autoPlay showControls={false} />
      </div>

      <div className="w-full grid gap-3">
        {questionData.options.map((option, idx) => {
          let stateClass = 'bg-card border-border hover:border-primary/50 hover:bg-muted';
          
          if (hasAnswered) {
            if (idx === questionData.correct_index) {
              stateClass = 'bg-success-soft border-success text-success';
            } else if (idx === selectedIdx) {
              stateClass = 'bg-danger-soft border-danger text-danger';
            } else {
              stateClass = 'bg-card border-border opacity-50';
            }
          }

          return (
            <button
              key={idx}
              disabled={hasAnswered}
              onClick={() => handleSelect(idx)}
              className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${stateClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="mt-8 text-center animate-fade-in-up">
          <p className="text-lg font-bold mb-1">{phrase.russian_text}</p>
          <p className="text-muted-foreground">{phrase.translation}</p>
        </div>
      )}
    </div>
  );
}
