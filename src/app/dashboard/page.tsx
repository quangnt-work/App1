'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useLessonsWithProgress } from '@/lib/queries/lessons';
import {
  Headphones,
  Mic,
  Flame,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { DashboardStats, LessonWithProgress } from '@/lib/types/database';

export default function DashboardPage() {
  const supabase = createClient();
  const { data: lessons, isLoading: lessonsLoading } = useLessonsWithProgress();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id);

      const totalListening = sessions?.reduce(
        (sum, s) => sum + (s.listening_minutes ?? 0),
        0
      ) ?? 0;
      const totalSpeaking = sessions?.reduce(
        (sum, s) => sum + (s.speaking_minutes ?? 0),
        0
      ) ?? 0;

      // Get progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const completed = progress?.filter((p) => p.status === 'completed').length ?? 0;

      // Get streak (count consecutive days from study_sessions)
      const sortedSessions = sessions
        ?.map((s) => s.session_date)
        .sort()
        .reverse() ?? [];

      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (sortedSessions.includes(today) || sortedSessions.includes(yesterday)) {
        let checkDate = sortedSessions.includes(today) ? today : yesterday;
        for (const date of sortedSessions) {
          if (date === checkDate) {
            streak++;
            const d = new Date(checkDate);
            d.setDate(d.getDate() - 1);
            checkDate = d.toISOString().split('T')[0];
          }
        }
      }

      // Get average speaking score from recent attempts
      const { data: attempts } = await supabase
        .from('speaking_attempts')
        .select('accuracy_score')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false })
        .limit(20);

      const avgScore =
        attempts && attempts.length > 0
          ? Math.round(
              attempts.reduce((sum, a) => sum + a.accuracy_score, 0) /
                attempts.length
            )
          : 0;

      return {
        total_listening_minutes: totalListening,
        total_speaking_minutes: totalSpeaking,
        current_level: 'A1',
        streak_count: streak,
        lessons_completed: completed,
        total_lessons: lessons?.length ?? 0,
        avg_speaking_score: avgScore,
        next_lesson: findNextLesson(lessons ?? []),
      };
    },
    enabled: !lessonsLoading,
  });

  const isLoading = lessonsLoading || statsLoading;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi tiến độ luyện nghe & nói của bạn
        </p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Listening minutes */}
            <StatCard
              icon={<Headphones size={20} />}
              iconBg="bg-listening-soft"
              iconColor="text-listening"
              label="Phút nghe"
              value={stats?.total_listening_minutes ?? 0}
              delay={0}
            />
            {/* Speaking minutes */}
            <StatCard
              icon={<Mic size={20} />}
              iconBg="bg-speaking-soft"
              iconColor="text-speaking"
              label="Phút nói"
              value={stats?.total_speaking_minutes ?? 0}
              delay={1}
            />
            {/* Streak */}
            <StatCard
              icon={<Flame size={20} />}
              iconBg="bg-warning-soft"
              iconColor="text-warning"
              label="Streak"
              value={`${stats?.streak_count ?? 0} ngày`}
              delay={2}
            />
            {/* Lessons completed */}
            <StatCard
              icon={<BookOpen size={20} />}
              iconBg="bg-success-soft"
              iconColor="text-success"
              label="Bài hoàn thành"
              value={`${stats?.lessons_completed ?? 0}/${stats?.total_lessons ?? 0}`}
              delay={3}
            />
          </div>

          {/* Speaking Score */}
          {(stats?.avg_speaking_score ?? 0) > 0 && (
            <div
              className="p-4 rounded-2xl bg-card border border-border mb-6
                         animate-fade-in delay-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp size={16} />
                  Điểm phát âm trung bình
                </span>
                <span className="text-lg font-bold text-primary">
                  {stats?.avg_speaking_score}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent
                             transition-all duration-700 ease-out"
                  style={{ width: `${stats?.avg_speaking_score ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Next Lesson CTA */}
          {stats?.next_lesson && (
            <Link
              href={`/learn/${stats.next_lesson.id}`}
              className="block p-5 rounded-2xl border border-primary/30 bg-primary-soft
                         hover:border-primary/50 transition-all group
                         animate-fade-in-up delay-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                    Bài tiếp theo
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    {stats.next_lesson.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Level {stats.next_lesson.level} •{' '}
                    {stats.next_lesson.estimated_minutes} phút
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground
                             flex items-center justify-center
                             group-hover:scale-110 transition-transform"
                >
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3 animate-fade-in delay-400">
            <Link
              href="/learn"
              className="p-4 rounded-2xl bg-card border border-border
                         hover:border-primary/30 hover:shadow-sm transition-all
                         text-center"
            >
              <BookOpen size={24} className="mx-auto text-primary mb-2" />
              <span className="text-sm font-medium">Tất cả bài học</span>
            </Link>
            <Link
              href="/progress"
              className="p-4 rounded-2xl bg-card border border-border
                         hover:border-primary/30 hover:shadow-sm transition-all
                         text-center"
            >
              <TrendingUp size={24} className="mx-auto text-accent mb-2" />
              <span className="text-sm font-medium">Xem tiến độ</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================
// Helper Components
// =============================================

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  delay: number;
}) {
  return (
    <div
      className={`p-4 rounded-2xl bg-card border border-border
                  animate-fade-in`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div
        className={`w-9 h-9 rounded-lg ${iconBg}
                    flex items-center justify-center mb-3 ${iconColor}`}
      >
        {icon}
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <div className="w-9 h-9 rounded-lg animate-shimmer mb-3" />
            <div className="w-16 h-6 rounded animate-shimmer mb-1" />
            <div className="w-12 h-3 rounded animate-shimmer" />
          </div>
        ))}
      </div>
      <div className="h-24 rounded-2xl animate-shimmer" />
    </div>
  );
}

function findNextLesson(
  lessons: LessonWithProgress[]
): LessonWithProgress | null {
  // Find first lesson that is in_progress or the first locked lesson
  const inProgress = lessons.find((l) => l.progress?.status === 'in_progress');
  if (inProgress) return inProgress;

  // Find first lesson with no progress (treat as available if it's the first one)
  const noProgress = lessons.find((l) => !l.progress);
  if (noProgress) return noProgress;

  return null;
}
