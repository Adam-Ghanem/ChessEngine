import { Activity, BookOpenCheck, CheckCircle2, Flame, Puzzle, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { readGameHistory } from "@/lib/gameHistory";
import { PUZZLE_IDS, PUZZLE_STORAGE_KEY, PUZZLE_TOTAL } from "@/lib/puzzleCatalog";
import "../progress.css";

const LEARN_STORAGE_KEY = "chessiq.learn.progress";
const TOTAL_LEARN_CHECKPOINTS = 9;

type ProgressSnapshot = {
  learnCheckpoints: number;
  completedLessons: number;
  solvedPuzzles: number;
  savedGames: number;
  movesPlayed: number;
};

function readProgress(): ProgressSnapshot {
  if (typeof window === "undefined") {
    return { learnCheckpoints: 0, completedLessons: 0, solvedPuzzles: 0, savedGames: 0, movesPlayed: 0 };
  }

  let learnCheckpoints = 0;
  let completedLessons = 0;
  let solvedPuzzles = 0;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    const values = Object.values(parsed)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
      .map((value) => Math.max(0, Math.min(3, Math.trunc(value))));
    learnCheckpoints = Math.min(TOTAL_LEARN_CHECKPOINTS, values.reduce((total, value) => total + value, 0));
    completedLessons = values.filter((value) => value >= 3).length;
  } catch {
    // Corrupt browser data should never prevent Progress from rendering.
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PUZZLE_STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((item): item is string => typeof item === "string" && PUZZLE_IDS.has(item));
      solvedPuzzles = Math.min(PUZZLE_TOTAL, new Set(valid).size);
    }
  } catch {
    // Corrupt browser data should never prevent Progress from rendering.
  }

  const games = readGameHistory(window.localStorage);
  const savedGames = games.length;
  const movesPlayed = games.reduce((total, game) => total + game.moves.length, 0);

  return { learnCheckpoints, completedLessons, solvedPuzzles, savedGames, movesPlayed };
}

function percentage(value: number, total: number) {
  return Math.round((Math.min(total, Math.max(0, value)) / total) * 100);
}

export default function Progress() {
  const snapshot = readProgress();
  const learnPercent = percentage(snapshot.learnCheckpoints, TOTAL_LEARN_CHECKPOINTS);
  const puzzlePercent = percentage(snapshot.solvedPuzzles, PUZZLE_TOTAL);
  const overallPercent = Math.round((learnPercent + puzzlePercent) / 2);

  const nextStep = snapshot.savedGames === 0
    ? { href: "/play", label: "Play a Game", detail: "Create your first saved game so ChessIQ can connect training with real board activity." }
    : snapshot.solvedPuzzles < PUZZLE_TOTAL
      ? { href: "/puzzles", label: "Continue Puzzles", detail: "Build calculation consistency with the next unsolved tactical position." }
      : snapshot.learnCheckpoints < TOTAL_LEARN_CHECKPOINTS
        ? { href: "/learn", label: "Continue Learn", detail: "Finish the remaining checkpoints and turn the concepts into repeatable habits." }
        : { href: "/analyze", label: "Open Analyze", detail: "Your current training set is complete. Put the habits to work on a real position." };

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell progress-product-shell">
        <ProductHeader activePath="/progress" />

        <section className="progress-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Progress</div>
            <h1>See the work compound.</h1>
            <p>One honest view of the activity saved on this device—no invented rating, streak, or performance data.</p>
          </div>
          <div className="progress-score" aria-label={`Overall training completion ${overallPercent}%`}>
            <span>Training completion</span>
            <strong>{overallPercent}%</strong>
            <small>Learn + Puzzles</small>
          </div>
        </section>

        <section className="progress-grid" aria-label="Training progress summary">
          <article className="progress-card">
            <div className="progress-card-icon"><BookOpenCheck size={20} /></div>
            <span className="analysis-label">Learn</span>
            <strong>{snapshot.learnCheckpoints}/{TOTAL_LEARN_CHECKPOINTS}</strong>
            <p>checkpoints completed</p>
            <div className="progress-meter" aria-label={`Learn progress ${learnPercent}%`}><span style={{ width: `${learnPercent}%` }} /></div>
            <small>{snapshot.completedLessons} lessons fully completed</small>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon"><Puzzle size={20} /></div>
            <span className="analysis-label">Puzzles</span>
            <strong>{snapshot.solvedPuzzles}/{PUZZLE_TOTAL}</strong>
            <p>positions solved</p>
            <div className="progress-meter" aria-label={`Puzzle progress ${puzzlePercent}%`}><span style={{ width: `${puzzlePercent}%` }} /></div>
            <small>Engine-legal tactical attempts</small>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon"><Swords size={20} /></div>
            <span className="analysis-label">Games</span>
            <strong>{snapshot.savedGames}</strong>
            <p>Games played</p>
            <div className="progress-activity" aria-label={`${snapshot.movesPlayed} saved moves played`}><span>{snapshot.movesPlayed}</span> saved moves</div>
            <small>Counted only from real Play sessions stored in this browser</small>
          </article>

          <article className="progress-card progress-card-total">
            <div className="progress-card-icon"><Trophy size={20} /></div>
            <span className="analysis-label">Completion</span>
            <strong>{overallPercent}%</strong>
            <p>current training set</p>
            <div className="progress-meter" aria-label={`Overall progress ${overallPercent}%`}><span style={{ width: `${overallPercent}%` }} /></div>
            <small>Calculated only from saved Learn and Puzzle activity</small>
          </article>
        </section>

        <section className="progress-focus" aria-labelledby="progress-focus-title">
          <div className="progress-focus-copy">
            <span className="progress-focus-icon"><Target size={19} /></span>
            <div>
              <span className="analysis-label">Next best step</span>
              <h2 id="progress-focus-title">Keep momentum in the product.</h2>
              <p>{nextStep.detail}</p>
            </div>
          </div>
          <Link href={nextStep.href} className="primary-action progress-primary">{nextStep.label}</Link>
        </section>

        <section className="progress-evidence" aria-label="What this dashboard measures">
          <div><CheckCircle2 size={17} /><strong>Evidence-based</strong><span>Only persisted product actions count.</span></div>
          <div><Flame size={17} /><strong>No fake streaks</strong><span>ChessIQ does not infer days you did not record.</span></div>
          <div><Activity size={17} /><strong>Device local</strong><span>Progress remains private in this browser for now.</span></div>
        </section>

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Play. Analyze. Learn. Improve.</p>
          <span>Progress is stored on this device.</span>
        </footer>
      </div>
    </main>
  );
}
