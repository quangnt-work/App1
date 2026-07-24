/**
 * Calculate similarity between two strings using Levenshtein distance.
 * Returns a value from 0.0 (completely different) to 1.0 (identical).
 */
export function calculateSimilarity(a: string, b: string): number {
  const clean = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:«»"'()]/g, '')
      .replace(/\s+/g, ' ');

  const s1 = clean(a);
  const s2 = clean(b);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= s2.length; j++) {
      if (i === 0) {
        matrix[i][j] = j;
      } else {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Format seconds to mm:ss string.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds to human readable duration.
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * Get score label and color class based on accuracy percentage.
 */
export function getScoreInfo(score: number): {
  label: string;
  colorClass: string;
  emoji: string;
} {
  if (score >= 90) return { label: 'Xuất sắc!', colorClass: 'text-success', emoji: '🌟' };
  if (score >= 70) return { label: 'Tốt lắm!', colorClass: 'text-success', emoji: '👍' };
  if (score >= 50) return { label: 'Khá tốt', colorClass: 'text-warning', emoji: '💪' };
  if (score >= 30) return { label: 'Cần cải thiện', colorClass: 'text-warning', emoji: '📚' };
  return { label: 'Thử lại nhé!', colorClass: 'text-danger', emoji: '🔄' };
}
