'use client';

import { useState, useEffect } from 'react';
import { AudioPlayer } from '../audio/AudioPlayer';
import { WaveformVisualizer } from '../audio/WaveformVisualizer';
import { SpeechFeedback } from '../audio/SpeechFeedback';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { calculateSimilarity } from '@/lib/utils/scoring';
import { Mic, Square, ArrowRight, RefreshCw } from 'lucide-react';
import type { AudioPhrase, ShadowingData } from '@/lib/types/database';

interface ShadowingExerciseProps {
  phrase: AudioPhrase;
  questionData: ShadowingData;
  onComplete: (score: number) => void;
}

export function ShadowingExercise({ phrase, questionData, onComplete }: ShadowingExerciseProps) {
  const { isListening, result, error, isSupported, startListening, stopListening, reset } = useSpeechRecognition('ru-RU');
  
  const [score, setScore] = useState<number | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (result && !isListening) {
      // Calculate score based on transcript similarity to expected text
      const similarity = calculateSimilarity(result.transcript, questionData.expected_text);
      const finalScore = Math.round(similarity * 100);
      setScore(finalScore);
      setHasCompleted(true);
    }
  }, [result, isListening, questionData.expected_text]);

  const handleNext = () => {
    if (score !== null) {
      onComplete(score);
    }
  };

  const handleRetry = () => {
    reset();
    setScore(null);
    setHasCompleted(false);
  };

  if (!isSupported) {
    return (
      <div className="p-6 rounded-2xl bg-danger-soft text-danger text-center animate-fade-in">
        <h3 className="font-bold mb-2">Trình duyệt không hỗ trợ</h3>
        <p className="text-sm">Tính năng luyện nói hiện chỉ hoạt động tốt trên Google Chrome hoặc Microsoft Edge.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full flex flex-col items-center animate-fade-in">
      <div className="text-center w-full mb-8">
        <h2 className="text-xl font-bold mb-2">Nghe và lặp lại</h2>
        
        {/* Phrase Info */}
        <div className="p-6 rounded-2xl bg-card border border-border mb-6">
          <p className="text-2xl font-bold text-foreground mb-1">{phrase.russian_text}</p>
          {phrase.phonetic && <p className="text-sm text-muted-foreground mb-3 font-mono">{phrase.phonetic}</p>}
          <p className="text-primary font-medium">{phrase.translation}</p>
        </div>

        {/* Audio Player */}
        <AudioPlayer url={phrase.audio_url} russianText={phrase.russian_text} autoPlay />
      </div>

      {/* Recording Section */}
      <div className="w-full flex flex-col items-center">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger-soft text-danger text-sm text-center w-full">
            {error}
          </div>
        )}

        {!hasCompleted ? (
          <div className="flex flex-col items-center gap-6">
            <WaveformVisualizer isRecording={isListening} />
            
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg
                ${isListening 
                  ? 'bg-danger text-white animate-recording-pulse' 
                  : 'bg-primary text-primary-foreground hover:scale-105'}`}
            >
              {isListening ? <Square size={32} /> : <Mic size={32} />}
            </button>
            <p className="text-sm text-muted-foreground">
              {isListening ? 'Đang nghe...' : 'Nhấn để nói'}
            </p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <SpeechFeedback 
              score={score} 
              recognizedText={result?.transcript ?? null} 
              expectedText={questionData.expected_text} 
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-xl border border-border bg-card font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Thử lại
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                Tiếp tục <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
