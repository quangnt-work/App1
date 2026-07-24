'use client';

import { getScoreInfo } from '@/lib/utils/scoring';

interface SpeechFeedbackProps {
  score: number | null;
  recognizedText: string | null;
  expectedText: string;
}

export function SpeechFeedback({ score, recognizedText, expectedText }: SpeechFeedbackProps) {
  if (score === null) return null;

  const { label, colorClass, emoji } = getScoreInfo(score);

  return (
    <div className="w-full space-y-4 animate-scale-in">
      {/* Score */}
      <div className="text-center">
        <div className={`text-5xl font-bold ${colorClass} mb-2`}>
          {score}%
        </div>
        <div className={`text-lg font-medium flex items-center justify-center gap-2 ${colorClass}`}>
          <span>{emoji}</span> {label}
        </div>
      </div>

      {/* Recognized text vs Expected */}
      <div className="p-4 rounded-xl bg-muted/50 text-sm space-y-3">
        <div>
          <span className="text-muted-foreground block mb-1">Hệ thống nghe được:</span>
          <p className="font-medium text-foreground">
            {recognizedText || '(Không nhận diện được giọng nói)'}
          </p>
        </div>
        
        {score < 100 && (
          <div>
            <span className="text-muted-foreground block mb-1">Câu mẫu:</span>
            <p className="font-medium text-success">{expectedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
