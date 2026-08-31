import { useMemo, useState } from "react";
import { CheckCircle2, Flame, Lightbulb, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BrandMark } from "@/components/BrandMark";
import { ChessBoard } from "@/components/ChessBoard";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

type Puzzle = {
  id: string;
  title: string;
  theme: string;
  difficulty: "Starter" | "Intermediate" | "Advanced";
  fen: string;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
};

const puzzles: Puzzle[] = [
  {
    id: "back-rank",
    title: "Back-rank finish",
    theme: "Mate in one",
    difficulty: "Starter",
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    prompt: "White to move. Find the forcing finish.",
    choices: ["Rd8#", "h3", "f3"],
    answer: "Rd8#",
    explanation: "Rd8# seals the eighth rank. Black has no flight square and no piece can interpose.",
  },
  {
    id: "fork",
    title: "Knight fork",
    theme: "Double attack",
    difficulty: "Intermediate",
    fen: "4k3/8/8/3q4/4N3/8/8/4K3 w - - 0 1",
    prompt: "White to move. Which jump wins the queen with check?",
    choices: ["Nf6+", "Nc3", "Ng5"],
    answer: "Nf6+",
    explanation: "Nf6+ attacks the king and queen at the same time, forcing the king to respond before the queen can move.",
  },
  {
    id: "remove-defender",
    title: "Remove the defender",
    theme: "Tactical conversion",
    difficulty: "Advanced",
    fen: "4r1k1/5ppp/8/8/2B5/8/5PPP/4R1K1 w - - 0 1",
    prompt: "White to move. Win the exchange with the cleanest forcing move.",
    choices: ["Rxe8+", "Bb5", "Kf1"],
    answer: "Rxe8+",
    explanation: "Rxe8+ removes the rook with tempo. The check forces the reply and converts the tactical advantage immediately.",
  },
];

const STORAGE_KEY = "chessiq-puzzles-solved-v1";

function loadSolved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function Puzzles() {
  const { theme, toggleTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>(loadSolved);
  const puzzle = puzzles[activeIndex];
  const isSolved = solved.includes(puzzle.id);
  const solvedCount = solved.length;
  const streak = useMemo(() => puzzles.reduce((count, item) => count + (solved.includes(item.id) ? 1 : 0), 0), [solved]);

  function choose(move: string) {
    setSelected(move);
    if (move === puzzle.answer) {
      if (!solved.includes(puzzle.id)) {
        const next = [...solved, puzzle.id];
        setSolved(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      toast.success("Puzzle solved.");
      return;
    }
    toast.error("Not quite. Look for the forcing move.");
  }

  function selectPuzzle(index: number) {
    setActiveIndex(index);
    setSelected(null);
  }

  function resetProgress() {
    setSolved([]);
    setSelected(null);
    localStorage.removeItem(STORAGE_KEY);
    toast("Puzzle progress reset.");
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="puzzles-product-shell">
        <header className="app-header product-header">
          <Link href="/analyze" className="brand-link" aria-label="Open ChessIQ Analyze"><BrandMark /></Link>
          <nav className="app-nav" aria-label="Primary navigation">
            <Link className="nav-item" href="/play">Play</Link>
            <Link className="nav-item" href="/analyze">Analyze</Link>
            <Link className="nav-item" href="/learn">Learn</Link>
            <Link className="nav-item is-active" href="/puzzles" aria-current="page">Puzzles</Link>
          </nav>
          <div className="header-actions">
            <button className="theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        <section className="puzzles-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Training</div>
            <h1>Calculate before you move.</h1>
            <p>Short tactical positions with immediate feedback, saved progress, and a focused premium training flow.</p>
          </div>
          <div className="puzzles-stats" aria-label="Puzzle training progress">
            <div><Trophy size={16} /><span>Solved</span><strong>{solvedCount}/{puzzles.length}</strong></div>
            <div><Flame size={16} /><span>Streak</span><strong>{streak}</strong></div>
          </div>
        </section>

        <div className="puzzles-layout">
          <aside className="puzzle-queue" aria-label="Puzzle queue">
            <div className="analysis-section-heading"><div><span className="analysis-label">Training set</span><h2>Puzzles</h2></div><Target size={18} /></div>
            <div className="puzzle-queue-list">
              {puzzles.map((item, index) => (
                <button key={item.id} className={index === activeIndex ? "is-active" : ""} onClick={() => selectPuzzle(index)} aria-pressed={index === activeIndex}>
                  <span>{solved.includes(item.id) ? <CheckCircle2 size={16} /> : index + 1}</span>
                  <div><strong>{item.title}</strong><small>{item.difficulty} · {item.theme}</small></div>
                </button>
              ))}
            </div>
            <button className="puzzle-reset" onClick={resetProgress}><RotateCcw size={15} /> Reset progress</button>
          </aside>

          <section className="puzzle-stage" aria-labelledby="puzzle-title">
            <header className="puzzle-stage-header">
              <div><span className="analysis-label">{puzzle.difficulty} · {puzzle.theme}</span><h2 id="puzzle-title">{puzzle.title}</h2><p>{puzzle.prompt}</p></div>
              {isSolved && <span className="puzzle-solved-chip"><CheckCircle2 size={15} /> Solved</span>}
            </header>

            <div className="puzzle-board-wrap">
              <ChessBoard
                fen={puzzle.fen}
                lastMove={{ from: "a1", to: "a1" }}
                engineArrow={{ from: "a1", to: "a1" }}
              />
            </div>

            <div className="puzzle-answer-panel">
              <div className="analysis-section-heading compact"><div><span className="analysis-label">Candidate moves</span><h2>Choose your move</h2></div><Lightbulb size={18} /></div>
              <div className="puzzle-choices" role="group" aria-label="Candidate moves">
                {puzzle.choices.map((move) => {
                  const chosen = selected === move;
                  const correct = chosen && move === puzzle.answer;
                  const incorrect = chosen && move !== puzzle.answer;
                  return <button key={move} className={`${correct ? "is-correct" : ""} ${incorrect ? "is-incorrect" : ""}`} aria-pressed={chosen} onClick={() => choose(move)}>{move}</button>;
                })}
              </div>
              {selected && (
                <div className={selected === puzzle.answer ? "puzzle-feedback is-success" : "puzzle-feedback"} role="status" aria-live="polite">
                  <strong>{selected === puzzle.answer ? "Correct." : "Keep calculating."}</strong>
                  <p>{selected === puzzle.answer ? puzzle.explanation : "Checks, captures, and threats come first. Try another candidate."}</p>
                </div>
              )}
              <div className="puzzle-next-row">
                <Link href="/learn" className="lesson-secondary">Study the concept</Link>
                <button className="lesson-primary primary-action" disabled={!isSolved || activeIndex === puzzles.length - 1} onClick={() => selectPuzzle(Math.min(activeIndex + 1, puzzles.length - 1))}>Next puzzle</button>
              </div>
            </div>
          </section>
        </div>

        <footer className="chessiq-footer product-footer"><BrandMark compact /><p>Play. Analyze. Learn. Improve.</p><span>ChessIQ puzzle training</span></footer>
      </div>
    </main>
  );
}
