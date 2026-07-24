import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  Exercise,
  ExerciseWithPhrase,
  AudioPhrase,
  ExerciseType,
} from '@/lib/types/database';

const supabase = createClient();

/**
 * Fetch exercises for a lesson, with their audio phrases.
 */
export function useExercisesWithPhrases(
  lessonId: string,
  type?: ExerciseType
) {
  return useQuery({
    queryKey: ['exercises', lessonId, type ?? 'all'],
    queryFn: async (): Promise<ExerciseWithPhrase[]> => {
      // 1. Fetch exercises
      let query = supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (type) {
        query = query.eq('type', type);
      }

      const { data: exercises, error: exercisesError } = await query;
      if (exercisesError) throw exercisesError;

      if (!exercises || exercises.length === 0) return [];

      // 2. Fetch related audio phrases
      const phraseIds = [
        ...new Set(exercises.map((e) => e.audio_phrase_id)),
      ];

      const { data: phrases, error: phrasesError } = await supabase
        .from('audio_phrases')
        .select('*')
        .in('id', phraseIds);

      if (phrasesError) throw phrasesError;

      // 3. Merge
      const phraseMap = new Map(
        (phrases ?? []).map((p) => [p.id, p])
      );

      return exercises.map((exercise) => ({
        ...exercise,
        audio_phrase: phraseMap.get(exercise.audio_phrase_id)!,
      }));
    },
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch audio phrases for a lesson.
 */
export function useAudioPhrases(lessonId: string) {
  return useQuery({
    queryKey: ['audio-phrases', lessonId],
    queryFn: async (): Promise<AudioPhrase[]> => {
      const { data, error } = await supabase
        .from('audio_phrases')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!lessonId,
    staleTime: 30 * 60 * 1000,
  });
}
