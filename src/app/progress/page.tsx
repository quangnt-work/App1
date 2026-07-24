'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Flame, Target, Award, CalendarDays, ChevronRight } from 'lucide-react';
import type { DashboardStats, LessonWithProgress } from '@/lib/types/database';
import { useLessonsWithProgress } from '@/lib/queries/lessons';

export default function ProgressPage() {
  const supabase = createClient();
  const { data: lessons, isLoading: lessonsLoading } = useLessonsWithProgress();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id);

      const totalListening = sessions?.reduce((sum, s) => sum + (s.listening_minutes ?? 0), 0) ?? 0;
      const totalSpeaking = sessions?.reduce((sum, s) => sum + (s.speaking_minutes ?? 0), 0) ?? 0;

      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const completed = progress?.filter((p) => p.status === 'completed').length ?? 0;

      // Simplistic streak calc for display
      const streak = sessions && sessions.length > 0 ? 1 : 0; 

      const { data: attempts } = await supabase
        .from('speaking_attempts')
        .select('accuracy_score')
        .eq('user_id', user.id);

      const avgScore = attempts && attempts.length > 0
        ? Math.round((attempts.reduce((sum, a) => sum + a.accuracy_score, 0) / attempts.length) * 100)
        : 0;

      return {
        total_listening_minutes: totalListening,
        total_speaking_minutes: totalSpeaking,
        current_level: 'A1',
        streak_count: streak,
        lessons_completed: completed,
        total_lessons: lessons?.length ?? 0,
        avg_speaking_score: avgScore,
        next_lesson: null,
      };
    },
    enabled: !lessonsLoading,
  });

  const isLoading = lessonsLoading || statsLoading;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Tiến độ của bạn</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi hành trình chinh phục tiếng Nga
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-40 rounded-3xl animate-shimmer" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 rounded-2xl animate-shimmer" />
            <div className="h-24 rounded-2xl animate-shimmer" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Stats Card */}
          <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-fade-in-up">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-primary-soft/80 font-medium mb-1">Trình độ hiện tại</p>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <Award size={32} />
                  {stats?.current_level || 'A1'}
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary-soft/80 font-medium mb-1">Chuỗi ngày học</p>
                <div className="text-3xl font-bold flex items-center justify-end gap-1">
                  {stats?.streak_count || 0} <Flame size={24} className="text-warning" />
                </div>
              </div>
            </div>

            {/* Time spent */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary-soft/20">
              <div>
                <p className="text-sm text-primary-soft/80 mb-1">Thời gian Nghe</p>
                <p className="text-xl font-semibold">{stats?.total_listening_minutes || 0} phút</p>
              </div>
              <div>
                <p className="text-sm text-primary-soft/80 mb-1">Thời gian Nói</p>
                <p className="text-xl font-semibold">{stats?.total_speaking_minutes || 0} phút</p>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <h2 className="text-lg font-bold pt-4">Thống kê chi tiết</h2>
          
          <div className="grid gap-4 animate-fade-in delay-100">
            {/* Speaking Score */}
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Độ chính xác phát âm</h3>
                  <p className="text-sm text-muted-foreground">Trung bình toàn khóa</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-success">{stats?.avg_speaking_score || 0}%</div>
            </div>

            {/* Lessons Completed */}
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Bài học đã hoàn thành</h3>
                  <p className="text-sm text-muted-foreground">Trên tổng số {stats?.total_lessons || 0} bài</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-accent">{stats?.lessons_completed || 0}</div>
            </div>
          </div>

          {/* Activity Graph Placeholder */}
          <div className="p-6 rounded-2xl bg-card border border-border animate-fade-in delay-200">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="text-muted-foreground" size={20} />
              <h3 className="font-semibold text-foreground">Hoạt động gần đây</h3>
            </div>
            
            <div className="flex items-end gap-2 h-32 w-full justify-between mt-4">
              {[40, 70, 20, 90, 50, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-muted rounded-t-sm" style={{ height: `${100 - h}%` }} />
                  <div className="w-full bg-primary rounded-t-sm" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
