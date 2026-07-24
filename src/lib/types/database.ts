// TypeScript types for the Russian Listening & Speaking App

// =============================================
// Database Types
// =============================================

export type LessonLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type SkillFocus = 'listening' | 'speaking' | 'mixed';
export type ProgressStatus = 'locked' | 'in_progress' | 'completed';
export type ExerciseType = 'listen_choose' | 'listen_image' | 'shadowing';
export type Difficulty = 'easy' | 'medium' | 'hard';

// =============================================
// Core Entities
// =============================================

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  level: LessonLevel;
  order_index: number;
  skill_focus: SkillFocus;
  estimated_minutes: number;
  thumbnail_url: string | null;
  created_at: string;
}

export interface AudioPhrase {
  id: string;
  lesson_id: string;
  russian_text: string;
  translation: string;
  phonetic: string | null;
  audio_url: string;
  slow_audio_url: string | null;
  image_url: string | null;
  difficulty: Difficulty;
  order_index: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  audio_phrase_id: string;
  type: ExerciseType;
  question_data: ListenChooseData | ListenImageData | ShadowingData;
  order_index: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  listening_score: number;
  speaking_score: number;
  attempts: number;
  completed_at: string | null;
  last_studied_at: string | null;
}

export interface SpeakingAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  audio_phrase_id: string;
  recognized_text: string | null;
  accuracy_score: number;
  attempted_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  session_date: string;
  listening_minutes: number;
  speaking_minutes: number;
  xp_earned: number;
  exercises_completed: number;
  created_at: string;
}

// =============================================
// Exercise Question Data Types (JSONB)
// =============================================

export interface ListenChooseData {
  options: string[];
  correct_index: number;
}

export interface ListenImageOption {
  image_url: string;
  label: string;
}

export interface ListenImageData {
  options: ListenImageOption[];
  correct_index: number;
}

export interface ShadowingData {
  expected_text: string;
  accept_threshold: number; // 0.0 – 1.0
}

// =============================================
// Composite / UI Types
// =============================================

/** Lesson with user's progress attached */
export interface LessonWithProgress extends Lesson {
  progress: UserProgress | null;
}

/** Exercise with its associated audio phrase */
export interface ExerciseWithPhrase extends Exercise {
  audio_phrase: AudioPhrase;
}

/** Dashboard stats */
export interface DashboardStats {
  total_listening_minutes: number;
  total_speaking_minutes: number;
  current_level: LessonLevel;
  streak_count: number;
  lessons_completed: number;
  total_lessons: number;
  avg_speaking_score: number;
  next_lesson: LessonWithProgress | null;
}

// =============================================
// Speech Recognition Types
// =============================================

export interface SpeechResult {
  transcript: string;
  confidence: number; // 0.0 – 1.0
}

export interface RecordingResult {
  blob: Blob;
  url: string;
  duration: number; // milliseconds
}
