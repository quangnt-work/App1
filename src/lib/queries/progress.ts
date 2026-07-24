import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { UserProgress, StudySession } from '@/lib/types/database';

const supabase = createClient();

/**
 * Fetch current user's progress for a specific lesson.
 */
export function useLessonProgress(lessonId: string) {
  return useQuery({
    queryKey: ['progress', lessonId],
    queryFn: async (): Promise<UserProgress | null> => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
}

/**
 * Complete a lesson and unlock the next one.
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      nextLessonId,
      listeningScore,
      speakingScore,
    }: {
      lessonId: string;
      nextLessonId: string | null;
      listeningScore: number;
      speakingScore: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      // 1. Mark current lesson as completed
      const { error: completeError } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            status: 'completed' as const,
            listening_score: listeningScore,
            speaking_score: speakingScore,
            completed_at: now,
            last_studied_at: now,
          },
          { onConflict: 'user_id,lesson_id' }
        );

      if (completeError) throw completeError;

      // 2. Unlock next lesson (if exists)
      if (nextLessonId) {
        // Only unlock if not already completed
        const { data: existing } = await supabase
          .from('user_progress')
          .select('status')
          .eq('user_id', user.id)
          .eq('lesson_id', nextLessonId)
          .maybeSingle();

        if (!existing || existing.status === 'locked') {
          await supabase.from('user_progress').upsert(
            {
              user_id: user.id,
              lesson_id: nextLessonId,
              status: 'in_progress' as const,
              listening_score: 0,
              speaking_score: 0,
              last_studied_at: now,
            },
            { onConflict: 'user_id,lesson_id' }
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Update or create a study session for today.
 */
export function useUpdateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listeningMinutes,
      speakingMinutes,
      xpEarned,
      exercisesCompleted,
    }: {
      listeningMinutes?: number;
      speakingMinutes?: number;
      xpEarned?: number;
      exercisesCompleted?: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Check if session exists for today
      const { data: existing } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_date', today)
        .maybeSingle();

      if (existing) {
        // Update existing session
        const { error } = await supabase
          .from('study_sessions')
          .update({
            listening_minutes:
              existing.listening_minutes + (listeningMinutes ?? 0),
            speaking_minutes:
              existing.speaking_minutes + (speakingMinutes ?? 0),
            xp_earned: existing.xp_earned + (xpEarned ?? 0),
            exercises_completed:
              existing.exercises_completed + (exercisesCompleted ?? 0),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new session
        const { error } = await supabase.from('study_sessions').insert({
          user_id: user.id,
          session_date: today,
          listening_minutes: listeningMinutes ?? 0,
          speaking_minutes: speakingMinutes ?? 0,
          xp_earned: xpEarned ?? 0,
          exercises_completed: exercisesCompleted ?? 0,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Save a speaking attempt.
 */
export function useSaveSpeakingAttempt() {
  return useMutation({
    mutationFn: async ({
      exerciseId,
      audioPhraseId,
      recognizedText,
      accuracyScore,
    }: {
      exerciseId: string;
      audioPhraseId: string;
      recognizedText: string;
      accuracyScore: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('speaking_attempts').insert({
        user_id: user.id,
        exercise_id: exerciseId,
        audio_phrase_id: audioPhraseId,
        recognized_text: recognizedText,
        accuracy_score: accuracyScore,
      });

      if (error) throw error;
    },
  });
}
