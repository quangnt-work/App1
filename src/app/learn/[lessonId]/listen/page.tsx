'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useExercisesWithPhrases } from '@/lib/queries/exercises';
import { useUpdateStudySession } from '@/lib/queries/progress';
import { ExerciseEngine } from '@/components/exercises/ExerciseEngine';
import { X, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function ListenExercisePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const router = useRouter();
  const { lessonId } = use(params);
  
  // Fetch only listening exercises
  const { data: exercises, isLoading } = useExercisesWithPhrases(lessonId);
  const { mutateAsync: updateSession } = useUpdateStudySession();

  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const listeningExercises = exercises?.filter(e => e.type.startsWith('listen_')) ?? [];

  const handleFinish = async (results: { listeningScore: number; speakingScore: number }) => {
    setFinalScore(results.listeningScore);
    setIsFinished(true);

    // Save to daily session (estimated 3 mins for listening session)
    try {
      await updateSession({
        listeningMinutes: 3,
        xpEarned: Math.round(results.listeningScore / 10),
        exercisesCompleted: listeningExercises.length
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

  if (listeningExercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 text-center pt-20">
        <p>Không có bài tập nghe nào trong bài học này.</p>
        <button onClick={() => router.back()} className="text-primary mt-4">Quay lại</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-listening-soft">
        <div className="w-full max-w-md p-8 bg-card rounded-3xl shadow-xl text-center animate-scale-in">
          <div className="w-20 h-20 bg-success-soft text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Hoàn thành xuất sắc!</h2>
          <p className="text-muted-foreground mb-8">Điểm bài tập nghe</p>
          
          <div className="text-6xl font-black text-listening mb-8">
            {finalScore}%
          </div>

          <button
            onClick={() => router.push(`/learn/${lessonId}`)}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover transition-colors"
          >
            Tiếp tục
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
        <ExerciseEngine exercises={listeningExercises} onFinish={handleFinish} />
      </div>
    </div>
  );
}
