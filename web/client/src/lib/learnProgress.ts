import { LESSONS } from "@/data/lessons";

export type LessonProgress = Record<string, number>;

function completedCheckpoints(progress: LessonProgress, lessonKey: string, checkpointCount: number) {
  return Math.min(Math.max(0, progress[lessonKey] ?? 0), checkpointCount);
}

export function findResumeLessonKey(progress: LessonProgress): string {
  const partial = LESSONS.find((lesson) => {
    const completed = completedCheckpoints(progress, lesson.key, lesson.checkpoints.length);
    return completed > 0 && completed < lesson.checkpoints.length;
  });
  if (partial) return partial.key;

  const firstIncomplete = LESSONS.find(
    (lesson) => completedCheckpoints(progress, lesson.key, lesson.checkpoints.length) < lesson.checkpoints.length,
  );
  return firstIncomplete?.key ?? LESSONS.at(-1)?.key ?? "";
}

export function findNextIncompleteLessonKey(currentKey: string, progress: LessonProgress): string | null {
  if (LESSONS.length === 0) return null;
  const currentIndex = Math.max(0, LESSONS.findIndex((lesson) => lesson.key === currentKey));

  for (let offset = 1; offset <= LESSONS.length; offset += 1) {
    const lesson = LESSONS[(currentIndex + offset) % LESSONS.length];
    if (completedCheckpoints(progress, lesson.key, lesson.checkpoints.length) < lesson.checkpoints.length) {
      return lesson.key;
    }
  }

  return null;
}
