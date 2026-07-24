'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListenChooseExercise } from './ListenChooseExercise';
import { ListenImageExercise } from './ListenImageExercise';
import { ShadowingExercise } from './ShadowingExercise';
import { useSaveSpeakingAttempt } from '@/lib/queries/progress';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ExerciseWithPhrase, ListenChooseData, ListenImageData, ShadowingData } from '@/lib/types/database';

interface ExerciseEngineProps {
  exercises: ExerciseWithPhrase[];
  onFinish: (results: { listeningScore: number; speakingScore: number }) => void;
}

export function ExerciseEngine({ exercises, onFinish }: ExerciseEngineProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Scoring state
  const [listeningCorrect, setListeningCorrect] = useState(0);
  const [listeningTotal, setListeningTotal] = useState(0);
  const [speakingScores, setSpeakingScores] = useState<number[]>([]);

  // UI state
  const [showFeedback, setShowFeedback] = useState<{ isCorrect: boolean } | null>(null);

  const { mutateAsync: saveSpeakingAttempt } = useSaveSpeakingAttempt();

  const currentExercise = exercises[currentIndex];
  const isLast = currentIndex === exercises.length - 1;

  const handleNext = () => {
    if (isLast) {
      // Calculate final scores
      const listeningScore = listeningTotal > 0 ? Math.round((listeningCorrect / listeningTotal) * 100) : 100;
      const speakingScore = speakingScores.length > 0 
        ? Math.round(speakingScores.reduce((a, b) => a + b, 0) / speakingScores.length)
        : 100;
      
      onFinish({ listeningScore, speakingScore });
    } else {
      setShowFeedback(null);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleListeningComplete = (isCorrect: boolean) => {
    setListeningTotal(prev => prev + 1);
    if (isCorrect) setListeningCorrect(prev => prev + 1);
    
    setShowFeedback({ isCorrect });
    
    // Auto advance after 2s
    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const handleSpeakingComplete = async (score: number) => {
    setSpeakingScores(prev => [...prev, score]);
    
    // Save attempt in background
    try {
      await saveSpeakingAttempt({
        exerciseId: currentExercise.id,
        audioPhraseId: currentExercise.audio_phrase_id,
        recognizedText: '', // Optional: pass from component if needed
        accuracyScore: score,
      });
    } catch (err) {
      console.error('Failed to save speaking attempt', err);
    }

    handleNext();
  };

  if (!currentExercise) return null;

  return (
    <div className="w-full flex flex-col min-h-[60vh] relative">
      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-8">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise Content */}
      <div className="flex-1 w-full relative">
        {currentExercise.type === 'listen_choose' && (
          <ListenChooseExercise
            key={currentExercise.id}
            phrase={currentExercise.audio_phrase}
            questionData={currentExercise.question_data as ListenChooseData}
            onComplete={handleListeningComplete}
          />
        )}
        
        {currentExercise.type === 'listen_image' && (
          <ListenImageExercise
            key={currentExercise.id}
            phrase={currentExercise.audio_phrase}
            questionData={currentExercise.question_data as ListenImageData}
            onComplete={handleListeningComplete}
          />
        )}

        {currentExercise.type === 'shadowing' && (
          <ShadowingExercise
            key={currentExercise.id}
            phrase={currentExercise.audio_phrase}
            questionData={currentExercise.question_data as ShadowingData}
            onComplete={handleSpeakingComplete}
          />
        )}
      </div>

      {/* Floating Feedback Overlay (for listening exercises) */}
      {showFeedback && (
        <div className={`fixed bottom-0 left-0 right-0 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-slide-in-right
          ${showFeedback.isCorrect ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}
        >
          <div className="container mx-auto max-w-3xl flex items-center justify-between">
            <div className="flex items-center gap-4 text-xl font-bold">
              {showFeedback.isCorrect ? (
                <>
                  <CheckCircle2 size={32} />
                  Chính xác!
                </>
              ) : (
                <>
                  <XCircle size={32} />
                  Chưa đúng rồi
                </>
              )}
            </div>
            <button
              onClick={handleNext}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-colors
                ${showFeedback.isCorrect ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'}`}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
