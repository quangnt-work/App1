'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLesson } from '@/lib/queries/lessons';
import { useLessonProgress } from '@/lib/queries/progress';
import { useExercisesWithPhrases } from '@/lib/queries/exercises';
import { Headphones, Mic, ArrowLeft, Play, CheckCircle2 } from 'lucide-react';

export default function LessonOverviewPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const router = useRouter();
  const { lessonId } = use(params);

  const { data: lesson, isLoading: lessonLoading } = useLesson(lessonId);
  const { data: progress, isLoading: progressLoading } = useLessonProgress(lessonId);
  
  // We just fetch to pre-cache them, or to show stats
  const { data: exercises, isLoading: exercisesLoading } = useExercisesWithPhrases(lessonId);

  const isLoading = lessonLoading || progressLoading || exercisesLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        Bài học không tồn tại.
        <br />
        <Link href="/learn" className="text-primary mt-4 inline-block">Quay lại</Link>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';
  const listeningScore = progress?.listening_score ?? 0;
  const speakingScore = progress?.speaking_score ?? 0;
  
  const listeningCount = exercises?.filter(e => e.type.startsWith('listen_')).length ?? 0;
  const speakingCount = exercises?.filter(e => e.type === 'shadowing').length ?? 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Top Bar */}
      <button 
        onClick={() => router.push('/learn')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      {/* Header Card */}
      <div className="p-8 rounded-3xl bg-card border border-border shadow-sm text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-soft text-primary font-bold mb-4">
          {lesson.level}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground">{lesson.description}</p>
        )}
      </div>

      {/* Progress Stats (if completed) */}
      {isCompleted && (
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in delay-100">
          <div className="p-4 rounded-2xl bg-success-soft border border-success/20 text-center">
            <p className="text-sm text-success font-medium mb-1">Điểm Nghe</p>
            <p className="text-3xl font-bold text-success">{listeningScore}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-success-soft border border-success/20 text-center">
            <p className="text-sm text-success font-medium mb-1">Điểm Nói</p>
            <p className="text-3xl font-bold text-success">{speakingScore}%</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4 animate-fade-in delay-200">
        <h2 className="text-lg font-bold mb-4">Chọn kỹ năng luyện tập:</h2>
        
        {/* Listening CTA */}
        {listeningCount > 0 && (
          <Link
            href={`/learn/${lesson.id}/listen`}
            className="flex items-center justify-between p-5 rounded-2xl bg-listening-soft border border-listening/20 hover:border-listening/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-listening text-white flex items-center justify-center">
                <Headphones size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-listening-soft-foreground">Luyện Nghe</h3>
                <p className="text-sm text-listening/80">{listeningCount} bài tập</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/50 text-listening flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={20} className="ml-1" />
            </div>
          </Link>
        )}

        {/* Speaking CTA */}
        {speakingCount > 0 && (
          <Link
            href={`/learn/${lesson.id}/speak`}
            className="flex items-center justify-between p-5 rounded-2xl bg-speaking-soft border border-speaking/20 hover:border-speaking/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-speaking text-white flex items-center justify-center">
                <Mic size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-speaking-soft-foreground">Luyện Nói</h3>
                <p className="text-sm text-speaking/80">{speakingCount} bài tập Shadowing</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/50 text-speaking flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={20} className="ml-1" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
