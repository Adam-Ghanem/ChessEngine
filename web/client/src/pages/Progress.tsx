import { Activity, BookOpenCheck, CheckCircle2, Flame, Puzzle, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { LEARN_STORAGE_KEY, LEARN_TOTAL_CHECKPOINTS, LESSONS } from "@/data/lessons";
import { readGameHistory } from "@/lib/gameHistory";
import { readNumberProgress } from "@/lib/localProgress";
import { summarizeComputerGameOutcomes } from "@/lib/progressStats";
import { PUZZLE_IDS, PUZZLE_STORAGE_KEY, PUZZLE_TOTAL } from "@/lib/puzzleCatalog";
import "../progress.css";

type ProgressSnapshot = {
  learnCheckpoints: number;
  completedLessons: number;
  solvedPuzzles: number;
  savedGames: number;
  movesPlayed: number;
  completedComputerGames: number;
  wins: number;
  draws: number;
  losses: number;
};

const emptyProgress: ProgressSnapshot = {
  learnCheckpoints: 0,
  completedLessons: 0,
  solvedPuzzles: 0,
  savedGames: 0,
  movesPlayed: 0,
  completedComputerGames: 0,
  wins: 0,
  draws: 0,
  losses: 0,
};

function readProgress(): ProgressSnapshot {
  if (typeof window === "undefined") return emptyProgress;

  const learnProgress = readNumberProgress(window.localStorage, LEARN_STORAGE_KEY);
  const learnCheckpoints = LESSONS.reduce(
    (total, lesson) => total + Math.min(learnProgress[lesson.key] ?? 0, lesson.checkpoints.length),
    0,
  );
  const completedLessons = LESSONS.filter(
    (lesson) => (learnProgress[lesson.key] ?? 0) >= lesson.checkpoints.length,
  ).length;

  let solvedPuzzles = 0;
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
  const outcomes = summarizeComputerGameOutcomes(games);

  return {
    learnCheckpoints,
    completedLessons,
    solvedPuzzles,
    savedGames,
    movesPlayed,
    completedComputerGames: outcomes.completed,
    wins: outcomes.wins,
    draws: outcomes.draws,
    losses: outcomes.losses,
  };
}

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((Math.min(total, Math.max(0, value)) / total) * 100) : 0;
}

function ProgressMeter({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="progress-meter"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Progress() {
  const snapshot = readProgress();
  const learnPercent = percentage(snapshot.learnCheckpoints, LEARN_TOTAL_CHECKPOINTS);
  const puzzlePercent = percentage(snapshot.solvedPuzzles, PUZZLE_TOTAL);
  const overallPercent = Math.round((learnPercent + puzzlePercent) / 2);

  const nextStep = snapshot.savedGames === 0
    ? { href: "/play", label: "Play a Game", detail: "Create your first saved game so ChessIQ can connect training with real board activity." }
    : snapshot.solvedPuzzles < PUZZLE_TOTAL
      ? { href: "/puzzles", label: "Continue Puzzles", detail: "Build calculation consistency with the next unsolved tactical position." }
      : snapshot.learnCheckpoints < LEARN_TOTAL_CHECKPOINTS
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
          <div className="progress-score" role="progressbar" aria-label="Overall training completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overallPercent}>
            <span>Training completion</span>
            <strong>{overallPercent}%</strong>
            <small>Learn + Puzzles</small>
          </div>
        </section>

        <section className="progress-grid" aria-label="Training progress summary">
          <article className="progress-card">
            <div className="progress-card-icon"><BookOpenCheck size={20} /></div>
            <span className="analysis-label">Learn</span>
            <strong>{snapshot.learnCheckpoints}/{LEARN_TOTAL_CHECKPOINTS}</strong>
            <p>checkpoints completed</p>
            <ProgressMeter label="Learn progress" value={learnPercent} />
            <small>{snapshot.completedLessons}/{LESSONS.length} lessons fully completed</small>
          </article>

          <article className="progress-card">
            <div className="progress-card-icon"><Puzzle size={20} /></div>
            <span className="analysis-label">Puzzles</span>
            <strong>{snapshot.solvedPuzzles}/{PUZZLE_TOTAL}</strong>
            <p>positions solved</p>
            <ProgressMeter label="Puzzle progress" value={puzzlePercent} />
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
            <ProgressMeter label="Overall progress" value={overallPercent} />
            <small>Calculated only from saved Learn and Puzzle activity</small>
          </article>
        </section>

        <section className="progress-results" aria-label="Results against ChessIQ">
          <div className="progress-results-copy">
            <span className="analysis-label">Results against ChessIQ</span>
            <h2>Completed games, from your side.</h2>
            <p>{snapshot.completedComputerGames} completed games against ChessIQ have a verified saved result and player side.</p>
          </div>
          <dl className="progress-results-grid">
            <div>
              <dt>Wins</dt>
              <dd>{snapshot.wins}</dd>
            </div>
            <div>
              <dt>Draws</dt>
              <dd>{snapshot.draws}</dd>
            </div>
            <div>
              <dt>Losses</dt>
              <dd>{snapshot.losses}</dd>
            </div>
          </dl>
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
