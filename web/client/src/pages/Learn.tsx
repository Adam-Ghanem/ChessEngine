import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Clock3, RotateCcw, Sparkles, Target } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { LEARN_STORAGE_KEY, LESSON_KEYS, LESSONS } from "@/data/lessons";
import { findNextIncompleteLessonKey, findResumeLessonKey } from "@/lib/learnProgress";
import { readNumberProgress, writeNumberProgress } from "@/lib/localProgress";

function loadLessonProgress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const stored = readNumberProgress(window.localStorage, LEARN_STORAGE_KEY);
  return Object.fromEntries(Object.entries(stored).filter(([key]) => LESSON_KEYS.has(key)));
}

export default function Learn() {
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(loadLessonProgress);
  const [selectedKey, setSelectedKey] = useState(() => findResumeLessonKey(loadLessonProgress()));
  const selectedLesson = useMemo(() => LESSONS.find((lesson) => lesson.key === selectedKey) ?? LESSONS[0], [selectedKey]);
  const completed = Math.min(lessonProgress[selectedLesson.key] ?? 0, selectedLesson.checkpoints.length);
  const isComplete = completed === selectedLesson.checkpoints.length;
  const nextLessonKey = isComplete ? findNextIncompleteLessonKey(selectedLesson.key, lessonProgress) : null;

  function persistProgress(next: Record<string, number>) {
    setLessonProgress(next);
    writeNumberProgress(window.localStorage, LEARN_STORAGE_KEY, next);
  }

  function completeCheckpoint() {
    if (isComplete) return;
    const nextValue = Math.min(selectedLesson.checkpoints.length, completed + 1);
    persistProgress({ ...lessonProgress, [selectedLesson.key]: nextValue });
    toast.success(nextValue === selectedLesson.checkpoints.length ? "Lesson complete." : "Checkpoint saved.");
  }

  function resetLesson() {
    persistProgress({ ...lessonProgress, [selectedLesson.key]: 0 });
    toast("Lesson progress reset.");
  }

  const completedCheckpoints = LESSONS.reduce(
    (total, lesson) => total + Math.min(lessonProgress[lesson.key] ?? 0, lesson.checkpoints.length),
    0,
  );

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell learn-product-shell">
        <ProductHeader activePath="/learn" />

        <section className="learn-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Learn</div>
            <h1>Turn analysis into habits.</h1>
            <p>Short, focused lessons convert engine feedback into decisions you can repeat over the board.</p>
            <Link href="/learn/openings" className="primary-action">Explore openings</Link>
          </div>
          <div className="learn-hero-stat" aria-label="Learning progress">
            <span>Completed checkpoints</span>
            <strong>{completedCheckpoints}</strong>
          </div>
        </section>

        <section className="learn-layout" aria-label="ChessIQ lessons">
          <div className="learn-grid">
            {LESSONS.map((lesson) => {
              const progress = Math.min(lessonProgress[lesson.key] ?? 0, lesson.checkpoints.length);
              return (
                <button
                  key={lesson.key}
                  type="button"
                  className={`lesson-card ${selectedLesson.key === lesson.key ? "is-active" : ""}`}
                  onClick={() => setSelectedKey(lesson.key)}
                  aria-pressed={selectedLesson.key === lesson.key}
                >
                  <span className="lesson-card-icon"><BookOpenCheck size={19} /></span>
                  <span className="lesson-card-meta"><span>{lesson.difficulty}</span><span><Clock3 size={13} /> {lesson.minutes} min</span></span>
                  <strong>{lesson.title}</strong>
                  <span className="lesson-card-copy">{lesson.summary}</span>
                  <span className="lesson-card-progress"><span style={{ width: `${(progress / lesson.checkpoints.length) * 100}%` }} /><i>{progress}/{lesson.checkpoints.length}</i></span>
                </button>
              );
            })}
          </div>

          <article className="lesson-workspace" aria-labelledby="lesson-title">
            <header className="lesson-workspace-header">
              <div>
                <span className="analysis-label">Active lesson</span>
                <h2 id="lesson-title">{selectedLesson.title}</h2>
                <p>{selectedLesson.summary}</p>
              </div>
              <span className={isComplete ? "lesson-status is-complete" : "lesson-status"}>
                {isComplete ? <CheckCircle2 size={15} /> : <Target size={15} />}
                {isComplete ? "Complete" : `${completed}/${selectedLesson.checkpoints.length}`}
              </span>
            </header>

            <ol className="checkpoint-list">
              {selectedLesson.checkpoints.map((checkpoint, index) => {
                const done = index < completed;
                const active = index === completed && !isComplete;
                return (
                  <li key={checkpoint} className={`${done ? "is-done" : ""} ${active ? "is-current" : ""}`}>
                    <span>{done ? <CheckCircle2 size={17} /> : index + 1}</span>
                    <p>{checkpoint}</p>
                  </li>
                );
              })}
            </ol>

            <div className="lesson-actions">
              <button type="button" className="lesson-secondary" onClick={resetLesson} disabled={completed === 0}>
                <RotateCcw size={15} /> Reset
              </button>
              {isComplete ? (
                nextLessonKey ? (
                  <button type="button" className="primary-action lesson-primary" onClick={() => setSelectedKey(nextLessonKey)}>
                    Continue to next lesson
                  </button>
                ) : (
                  <Link href="/analyze" className="primary-action lesson-primary">Open Analyze</Link>
                )
              ) : (
                <button type="button" className="primary-action lesson-primary" onClick={completeCheckpoint}>
                  Complete checkpoint
                </button>
              )}
            </div>
          </article>
        </section>

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Learn the idea. Find it in your games.</p>
          <span>Progress is stored on this device.</span>
        </footer>
      </div>
    </main>
  );
}
