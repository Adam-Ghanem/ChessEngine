import { Brain, Gamepad2, GraduationCap, Sparkles, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { ProductHeader } from "@/components/ProductHeader";
import { LEARN_STORAGE_KEY, LESSONS } from "@/data/lessons";
import { readGameHistory } from "@/lib/gameHistory";
import { readNumberProgress } from "@/lib/localProgress";
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

function planFor(games: number, lessons: number, puzzles: number) {
  if (games === 0) {
    return {
      eyebrow: "Build game evidence",
      title: "Play one complete training game",
      copy: "Coach recommendations get more useful after ChessIQ has a real game from this device to work from.",
      href: "/play",
      action: "Start a game",
      icon: Gamepad2,
    };
  }
  if (puzzles < 3) {
    return {
      eyebrow: "Sharpen calculation",
      title: "Solve the next tactical set",
      copy: "Your device has game activity, but only a small tactics sample. Add puzzle evidence before broadening the plan.",
      href: "/puzzles",
      action: "Train tactics",
      icon: Target,
    };
  }
  if (lessons < LESSONS.length) {
    return {
      eyebrow: "Convert patterns into knowledge",
      title: "Continue structured learning",
      copy: "You have both games and tactical work recorded. The next useful step is finishing more lesson checkpoints.",
      href: "/learn",
      action: "Open Learn",
      icon: GraduationCap,
    };
  }
  return {
    eyebrow: "Review your evidence",
    title: "Analyze a real position",
    copy: "You have activity across Play, Puzzles, and Learn. Use the first-party ChessEngine to inspect a position from your own games.",
    href: "/analyze",
    action: "Open Analyze",
    icon: Brain,
  };
}

export default function Coach() {
  const games = readGameHistory().length;
  const lessons = countCompletedLessons();
  const puzzles = countValidSolvedPuzzles();
  const plan = planFor(games, lessons, puzzles);
  const PlanIcon = plan.icon;

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell coach-product-shell">
        <ProductHeader activePath="/coach" />

        <section className="coach-hero">
          <div>
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Coach</div>
            <h1>A training plan grounded in what you actually did.</h1>
            <p>ChessIQ Coach reads only activity stored on this device and turns it into a clear next step. No invented performance data.</p>
          </div>
          <div className="coach-trust-card">
            <TrendingUp size={20} />
            <strong>Evidence first</strong>
            <span>Games, lessons, and solved puzzles only</span>
          </div>
        </section>

        <section className="coach-grid" aria-label="Training evidence">
          <article className="coach-stat-card"><Gamepad2 size={18} /><span>Saved games</span><strong>{games}</strong><small>from Play on this device</small></article>
          <article className="coach-stat-card"><GraduationCap size={18} /><span>Lessons completed</span><strong>{lessons}/{LESSONS.length}</strong><small>verified from Learn checkpoints</small></article>
          <article className="coach-stat-card"><Target size={18} /><span>Solved puzzles</span><strong>{puzzles}</strong><small>verified catalog entries</small></article>
        </section>

        <section className="coach-plan" aria-label="Recommended training plan">
          <div className="coach-plan-icon"><PlanIcon size={24} /></div>
          <div className="coach-plan-copy">
            <span>{plan.eyebrow}</span>
            <h2>{plan.title}</h2>
            <p>{plan.copy}</p>
          </div>
          <Link href={plan.href} className="primary-action">{plan.action}</Link>
        </section>

        <section className="coach-principles" aria-labelledby="coach-principles-title">
          <div><Brain size={20} /><h2 id="coach-principles-title">How Coach decides</h2></div>
          <p>Coach prioritizes missing verified evidence first, then moves you toward review. It ignores stale puzzle IDs and incomplete lesson checkpoints instead of inflating your training history.</p>
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
