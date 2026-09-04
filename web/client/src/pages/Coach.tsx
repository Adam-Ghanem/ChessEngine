import { Brain, Gamepad2, GraduationCap, Sparkles, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { LEARN_STORAGE_KEY, LESSONS } from "@/data/lessons";
import { readGameHistory } from "@/lib/gameHistory";
import { readNumberProgress } from "@/lib/localProgress";
import { summarizeComputerGameOutcomes } from "@/lib/progressStats";
import { PUZZLE_IDS, PUZZLE_STORAGE_KEY } from "@/lib/puzzleCatalog";
import "../coach.css";

function countCompletedLessons() {
  if (typeof window === "undefined") return 0;
  const progress = readNumberProgress(window.localStorage, LEARN_STORAGE_KEY);
  return LESSONS.filter((lesson) => (progress[lesson.key] ?? 0) >= lesson.checkpoints.length).length;
}

function countValidSolvedPuzzles() {
  if (typeof window === "undefined") return 0;
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(PUZZLE_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return 0;
    return new Set(value.filter((id): id is string => typeof id === "string" && PUZZLE_IDS.has(id))).size;
  } catch {
    return 0;
  }
}

type TrainingStep = {
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  action: string;
  icon: typeof Gamepad2;
};

const playStep: TrainingStep = {
  eyebrow: "Build game evidence",
  title: "Play one complete training game",
  copy: "Give Coach a completed verified game against ChessIQ so later recommendations are grounded in a real result from your side.",
  href: "/play",
  action: "Start a game",
  icon: Gamepad2,
};

const puzzleStep: TrainingStep = {
  eyebrow: "Sharpen calculation",
  title: "Solve the next tactical set",
  copy: "Add a stronger tactics sample before broadening the plan. Only verified catalog solves count here.",
  href: "/puzzles",
  action: "Train tactics",
  icon: Target,
};

const learnStep: TrainingStep = {
  eyebrow: "Convert patterns into knowledge",
  title: "Continue structured learning",
  copy: "Finish more lesson checkpoints so tactical patterns become repeatable decisions at the board.",
  href: "/learn",
  action: "Open Learn",
  icon: GraduationCap,
};

const analyzeStep: TrainingStep = {
  eyebrow: "Review your evidence",
  title: "Analyze a real position",
  copy: "Use the first-party ChessEngine to inspect a position from your own games and turn activity into feedback.",
  href: "/analyze",
  action: "Open Analyze",
  icon: Brain,
};

function buildTrainingQueue(completedComputerGames: number, lessons: number, puzzles: number): TrainingStep[] {
  const queue: TrainingStep[] = [];

  if (completedComputerGames === 0) queue.push(playStep);
  if (puzzles < 3) queue.push(puzzleStep);
  if (lessons < LESSONS.length) queue.push(learnStep);

  queue.push(analyzeStep);

  if (queue.length < 3) {
    queue.push(puzzleStep, learnStep);
  }

  return queue.filter((step, index) => queue.findIndex((candidate) => candidate.href === step.href) === index).slice(0, 3);
}

export default function Coach() {
  const gameHistory = readGameHistory();
  const savedGames = gameHistory.length;
  const gameOutcomes = summarizeComputerGameOutcomes(gameHistory);
  const completedComputerGames = gameOutcomes.completed;
  const lessons = countCompletedLessons();
  const puzzles = countValidSolvedPuzzles();
  const trainingQueue = buildTrainingQueue(completedComputerGames, lessons, puzzles);
  const primaryPlan = trainingQueue[0];
  const PlanIcon = primaryPlan.icon;

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell coach-product-shell">
        <ProductHeader activePath="/coach" />

        <section className="coach-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Coach</div>
            <h1>A training plan grounded in what you actually did.</h1>
            <p>ChessIQ Coach reads only activity stored on this device and turns it into a prioritized training queue. No invented performance data.</p>
          </div>
          <div className="coach-trust-card">
            <TrendingUp size={20} />
            <strong>Evidence first</strong>
            <span>Completed games, lessons, and solved puzzles only</span>
          </div>
        </section>

        <section className="coach-grid" aria-label="Training evidence">
          <article className="coach-stat-card"><Gamepad2 size={18} /><span>Completed vs ChessIQ</span><strong>{completedComputerGames}</strong><small>{savedGames} saved game{savedGames === 1 ? "" : "s"} total · only verified results count</small></article>
          <article className="coach-stat-card"><GraduationCap size={18} /><span>Lessons completed</span><strong>{lessons}/{LESSONS.length}</strong><small>verified from Learn checkpoints</small></article>
          <article className="coach-stat-card"><Target size={18} /><span>Solved puzzles</span><strong>{puzzles}</strong><small>verified catalog entries</small></article>
        </section>

        <section className="coach-plan" aria-label="Recommended training plan">
          <div className="coach-plan-icon"><PlanIcon size={24} /></div>
          <div className="coach-plan-copy">
            <span>Next · {primaryPlan.eyebrow}</span>
            <h2>{primaryPlan.title}</h2>
            <p>{primaryPlan.copy}</p>
          </div>
          <Link href={primaryPlan.href} className="primary-action">{primaryPlan.action}</Link>
        </section>

        <section className="coach-plan-queue" aria-label="Training plan steps">
          {trainingQueue.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <article className="coach-plan-step" key={step.href}>
                <div className="coach-plan-step-number">{index === 0 ? "Next" : index === 1 ? "Then" : "After"}</div>
                <div className="coach-plan-step-icon"><StepIcon size={18} /></div>
                <div className="coach-plan-step-copy">
                  <span>{step.eyebrow}</span>
                  <strong>{step.title}</strong>
                </div>
                <Link href={step.href} aria-label={`${step.action}: ${step.title}`}>{step.action}</Link>
              </article>
            );
          })}
        </section>

        <section className="coach-principles" aria-labelledby="coach-principles-title">
          <div><Brain size={20} /><h2 id="coach-principles-title">How Coach decides</h2></div>
          <p>Coach prioritizes missing verified evidence first. A saved game counts as game evidence only when it is a completed ChessIQ game with both a persisted result and player side; local, ongoing, and legacy-incomplete records do not unlock review-first recommendations.</p>
          <div className="coach-links">
            <Link href="/games">Review saved games</Link>
            <Link href="/progress">Open Progress</Link>
          </div>
        </section>

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Play. Train. Review.</p>
          <span>Coach data stays in this browser.</span>
        </footer>
      </div>
    </main>
  );
}
