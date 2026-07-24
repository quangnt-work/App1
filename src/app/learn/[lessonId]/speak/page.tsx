'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useExercisesWithPhrases } from '@/lib/queries/exercises';
import { useUpdateStudySession, useCompleteLesson, useLessonProgress } from '@/lib/queries/progress';
import { useLessonsByLevel } from '@/lib/queries/lessons';
import { ExerciseEngine } from '@/components/exercises/ExerciseEngine';
import { X, Trophy, Mic } from 'lucide-react';
import { useState } from 'react';

export default function SpeakExercisePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const router = useRouter();
  const { lessonId } = use(params);
  
  // Fetch only speaking (shadowing) exercises
  const { data: exercises, isLoading } = useExercisesWithPhrases(lessonId);
  const { data: progress } = useLessonProgress(lessonId);
  const { data: levelLessons } = useLessonsByLevel('A1'); // Simplification for MVP, should be actual level

  const { mutateAsync: updateSession } = useUpdateStudySession();
  const { mutateAsync: completeLesson } = useCompleteLesson();

  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const speakingExercises = exercises?.filter(e => e.type === 'shadowing') ?? [];

  const handleFinish = async (results: { listeningScore: number; speakingScore: number }) => {
    setFinalScore(results.speakingScore);
    setIsFinished(true);

    try {
      // 1. Save to daily session (estimated 5 mins for speaking)
      await updateSession({
        speakingMinutes: 5,
        xpEarned: Math.round(results.speakingScore / 10),
        exercisesCompleted: speakingExercises.length
      });

      // 2. Complete lesson if both skills are done (simplified logic for MVP: just complete it after speaking)
      // Find next lesson to unlock
      let nextLessonId = null;
      if (levelLessons) {
        const currentIndex = levelLessons.findIndex(l => l.id === lessonId);
        if (currentIndex !== -1 && currentIndex < levelLessons.length - 1) {
          nextLessonId = levelLessons[currentIndex + 1].id;
        }
      }

      await completeLesson({
        lessonId,
        nextLessonId,
        listeningScore: progress?.listening_score ?? 100, // keep previous or assume 100
        speakingScore: results.speakingScore
      });

    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (speakingExercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 text-center pt-20">
        <p>Không có bài tập nói nào trong bài học này.</p>
        <button onClick={() => router.back()} className="text-primary mt-4">Quay lại</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-speaking-soft">
        <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-xl text-center animate-scale-in">
          <div className="w-20 h-20 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quá tuyệt vời!</h2>
          <p className="text-muted-foreground mb-8">Điểm phát âm của bạn</p>
          
          <div className="text-6xl font-black text-speaking mb-8 flex justify-center items-center gap-2">
            {finalScore}%
            <Mic className="text-speaking/50" size={32} />
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Top Bar */}
      <div className="container mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => router.push(`/learn/${lessonId}`)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Thoát"
        >
          <X size={24} />
        </button>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-6">
        <ExerciseEngine exercises={speakingExercises} onFinish={handleFinish} />
      </div>
    </div>
  );
}
