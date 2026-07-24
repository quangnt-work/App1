'use client';

import Link from 'next/link';
import { useLessonsWithProgress } from '@/lib/queries/lessons';
import {
  Lock,
  CheckCircle2,
  Play,
  Headphones,
  Mic,
  Clock,
} from 'lucide-react';
import type {
  LessonLevel,
  LessonWithProgress,
  ProgressStatus,
} from '@/lib/types/database';

const LEVELS: { key: LessonLevel; label: string; description: string }[] = [
  { key: 'A1', label: 'Sơ cấp 1', description: 'Bắt đầu từ con số 0' },
  { key: 'A2', label: 'Sơ cấp 2', description: 'Giao tiếp cơ bản' },
  { key: 'B1', label: 'Trung cấp 1', description: 'Hội thoại hàng ngày' },
  { key: 'B2', label: 'Trung cấp 2', description: 'Giao tiếp tự tin' },
];

export default function LearnPage() {
  const { data: lessons, isLoading, error } = useLessonsWithProgress();

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Lộ trình học</h1>
        <p className="text-muted-foreground mt-1">
          Hoàn thành từng bài để mở khóa bài tiếp theo
        </p>
      </div>

      {isLoading ? (
        <LearnSkeleton />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-danger-soft text-danger text-center">
          Không thể tải bài học. Hãy thử lại sau.
        </div>
      ) : (
        <div className="space-y-10">
          {LEVELS.map((level) => {
            const levelLessons =
              lessons?.filter((l) => l.level === level.key) ?? [];

            if (levelLessons.length === 0) return null;

            return (
              <LevelSection
                key={level.key}
                level={level}
                lessons={levelLessons}
              />
            );
          })}

          {/* Coming soon levels */}
          {LEVELS.filter(
            (level) => !lessons?.some((l) => l.level === level.key)
          ).map((level) => (
            <div
              key={level.key}
              className="p-6 rounded-2xl border border-dashed border-border
                         text-center opacity-60"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {level.label} ({level.key}) — Sắp ra mắt
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// Level Section
// =============================================

function LevelSection({
  level,
  lessons,
}: {
  level: { key: LessonLevel; label: string; description: string };
  lessons: LessonWithProgress[];
}) {
  const completed = lessons.filter(
    (l) => l.progress?.status === 'completed'
  ).length;
  const progress = Math.round((completed / lessons.length) * 100);

  return (
    <section className="animate-fade-in">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center
                         w-8 h-8 rounded-lg bg-primary-soft text-primary
                         text-sm font-bold"
            >
              {level.key}
            </span>
            {level.label}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {level.description}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-foreground">
            {completed}/{lessons.length}
          </span>
          <div className="w-20 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson Cards */}
      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <LessonCard key={lesson.id} lesson={lesson} index={index} />
        ))}
      </div>
    </section>
  );
}

// =============================================
// Lesson Card
// =============================================

function LessonCard({
  lesson,
  index,
}: {
  lesson: LessonWithProgress;
  index: number;
}) {
  const status = getLessonStatus(lesson, index);
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const content = (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                  ${
                    isLocked
                      ? 'bg-muted/50 border-border opacity-60 cursor-not-allowed'
                      : isCompleted
                        ? 'bg-success-soft border-success/20 hover:border-success/40'
                        : 'bg-card border-border hover:border-primary/40 hover:shadow-sm cursor-pointer'
                  }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Status Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${
                      isLocked
                        ? 'bg-muted text-muted-foreground'
                        : isCompleted
                          ? 'bg-success text-white'
                          : 'bg-primary-soft text-primary'
                    }`}
      >
        {isLocked ? (
          <Lock size={18} />
        ) : isCompleted ? (
          <CheckCircle2 size={18} />
        ) : (
          <Play size={18} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold ${
            isLocked ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {lesson.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} /> {lesson.estimated_minutes} phút
          </span>
          {lesson.skill_focus !== 'mixed' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {lesson.skill_focus === 'listening' ? (
                <Headphones size={12} />
              ) : (
                <Mic size={12} />
              )}
              {lesson.skill_focus === 'listening' ? 'Nghe' : 'Nói'}
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      {isCompleted && lesson.progress && (
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-bold text-success">
            {Math.round(
              ((lesson.progress.listening_score +
                lesson.progress.speaking_score) /
                2)
            )}
            %
          </div>
          <div className="text-xs text-muted-foreground">Điểm TB</div>
        </div>
      )}
    </div>
  );

  if (isLocked) return <div className="animate-fade-in">{content}</div>;

  return (
    <Link
      href={`/learn/${lesson.id}`}
      className="block animate-fade-in"
    >
      {content}
    </Link>
  );
}

// =============================================
// Helpers
// =============================================

function getLessonStatus(
  lesson: LessonWithProgress,
  index: number
): ProgressStatus {
  if (lesson.progress?.status) return lesson.progress.status;
  // First lesson with no progress = available
  if (index === 0) return 'in_progress';
  return 'locked';
}

function LearnSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(2)].map((_, i) => (
        <div key={i}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg animate-shimmer" />
            <div className="w-32 h-5 rounded animate-shimmer" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div
                key={j}
                className="h-20 rounded-2xl animate-shimmer"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
