import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Clock3, Moon, RotateCcw, Sparkles, Sun, Target } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { useTheme } from "@/contexts/ThemeContext";

type Lesson = {
  key: string;
  title: string;
  summary: string;
  difficulty: string;
  minutes: number;
  checkpoints: string[];
};

const lessons: Lesson[] = [
  {
    key: "checks-captures-threats",
    title: "Checks, captures, threats",
    summary: "Build the move-order habit that catches forcing tactics before you calculate quieter ideas.",
    difficulty: "Foundation",
    minutes: 7,
    checkpoints: [
      "Scan every legal check before choosing a candidate move.",
      "Compare forcing captures by material, king safety, and recapture sequence.",
      "Only then calculate direct threats and improving moves.",
    ],
  },
  {
    key: "piece-activity",
    title: "Improve your worst piece",
    summary: "Turn passive positions into plans by finding the piece contributing least to your position.",
    difficulty: "Intermediate",
    minutes: 9,
    checkpoints: [
      "Identify the least active piece and the squares it wants.",
      "Check whether a pawn break can open a useful file or diagonal.",
      "Recalculate forcing moves before committing to the positional plan.",
    ],
  },
  {
    key: "blunder-check",
    title: "The 10-second blunder check",
    summary: "Use a repeatable safety pass before every move to cut one-move mistakes from your games.",
    difficulty: "Essential",
    minutes: 5,
    checkpoints: [
      "After choosing a move, imagine it already played on the board.",
      "Ask what checks, captures, and threats your opponent gains immediately.",
      "If the move survives, compare it once more with your strongest alternative.",
    ],
  },
];

function loadLessonProgress(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("chessiq.learn.progress") ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export default function Learn() {
  const { theme, toggleTheme } = useTheme();
  const [selectedKey, setSelectedKey] = useState(lessons[0].key);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(loadLessonProgress);
  const selectedLesson = useMemo(() => lessons.find((lesson) => lesson.key === selectedKey) ?? lessons[0], [selectedKey]);
  const completed = Math.min(lessonProgress[selectedLesson.key] ?? 0, selectedLesson.checkpoints.length);
  const isComplete = completed === selectedLesson.checkpoints.length;

  function persistProgress(next: Record<string, number>) {
    setLessonProgress(next);
    window.localStorage.setItem("chessiq.learn.progress", JSON.stringify(next));
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

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell learn-product-shell">
        <header className="app-header product-header">
          <Link href="/analyze" className="brand-link" aria-label="Open ChessIQ Analyze">
            <BrandMark />
          </Link>
          <nav className="app-nav" aria-label="Primary navigation">
            <button className="nav-item" onClick={() => toast("Play workspace is the next production surface.")}>Play</button>
            <Link className="nav-item" href="/analyze">Analyze</Link>
            <Link className="nav-item is-active" href="/learn" aria-current="page">Learn</Link>
            <button className="nav-item" onClick={() => toast("Puzzle training is the next production surface.")}>Puzzles</button>
          </nav>
          <div className="header-actions">
            <button
              className="theme-toggle"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <section className="learn-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Learn</div>
            <h1>Turn analysis into habits.</h1>
            <p>Short, focused lessons convert engine feedback into decisions you can repeat over the board.</p>
          </div>
          <div className="learn-hero-stat" aria-label="Learning progress">
            <span>Completed checkpoints</span>
            <strong>{Object.values(lessonProgress).reduce((total, value) => total + value, 0)}</strong>
          </div>
        </section>

        <section className="learn-layout" aria-label="ChessIQ lessons">
          <div className="learn-grid">
            {lessons.map((lesson) => {
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
                <Link href="/analyze" className="primary-action lesson-primary">Open Analyze</Link>
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
