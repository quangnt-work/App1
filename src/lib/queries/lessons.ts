import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Lesson,
  LessonWithProgress,
  LessonLevel,
} from '@/lib/types/database';

const supabase = createClient();

/**
 * Fetch all lessons with current user's progress attached.
 */
export function useLessonsWithProgress() {
  return useQuery({
    queryKey: ['lessons', 'with-progress'],
    queryFn: async (): Promise<LessonWithProgress[]> => {
      // 1. Fetch lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('level')
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // 2. Fetch current user's progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*');

      if (progressError) throw progressError;

      // 3. Merge
      const progressMap = new Map(
        progress?.map((p) => [p.lesson_id, p]) ?? []
      );

      return (lessons ?? []).map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) ?? null,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch lessons filtered by level.
 */
export function useLessonsByLevel(level: LessonLevel) {
  return useQuery({
    queryKey: ['lessons', 'level', level],
    queryFn: async (): Promise<Lesson[]> => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('level', level)
        .order('order_index');

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch a single lesson by ID.
 */
export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: async (): Promise<Lesson> => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000,
  });
}
