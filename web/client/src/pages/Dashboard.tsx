import { Activity, BarChart3, BookOpen, ChevronRight, Gamepad2, LibraryBig, Puzzle, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { ProductHeader } from "@/components/ProductHeader";
import { readGameHistory } from "@/lib/gameHistory";

const LEARN_STORAGE_KEY = "chessiq.learn.progress";
const PUZZLE_STORAGE_KEY = "chessiq-puzzles-solved-v1";

function readLocalSnapshot() {
  if (typeof window === "undefined") return { games: 0, moves: 0, puzzles: 0, lessons: 0 };
  const games = readGameHistory(window.localStorage);
  let puzzles = 0;
  let lessons = 0;

  try {
    const solved = JSON.parse(window.localStorage.getItem(PUZZLE_STORAGE_KEY) ?? "[]");
    puzzles = Array.isArray(solved) ? new Set(solved.filter((item): item is string => typeof item === "string")).size : 0;
  } catch {}

  try {
    const progress = JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? "{}") as Record<string, unknown>;
    lessons = Object.values(progress).filter(value => typeof value === "number" && value >= 3).length;
  } catch {}

  return {
    games: games.length,
    moves: games.reduce((total, game) => total + game.moves.length, 0),
    puzzles,
    lessons,
  };
}

const features = [
  { href: "/play", title: "Play", copy: "Start a real game backed by ChessIQ legality.", icon: Gamepad2, accent: "gold" },
  { href: "/puzzles", title: "Puzzles", copy: "Train calculation with engine-legal positions.", icon: Puzzle, accent: "green" },
  { href: "/learn", title: "Learn", copy: "Build repeatable chess habits lesson by lesson.", icon: BookOpen, accent: "blue" },
  { href: "/analyze", title: "Analyze", copy: "Inspect positions with the first-party ChessEngine.", icon: Search, accent: "violet" },
] as const;

export default function Dashboard() {
  const snapshot = readLocalSnapshot();

  return (
    <main className="app-shell chessiq-shell premium-product-page">
      <div className="analysis-product-shell dashboard-product-shell">
        <ProductHeader activePath="/" />

        <section className="premium-dashboard-hero">
          <div className="premium-hero-copy">
            <span className="premium-eyebrow"><Sparkles size={14} /> ChessIQ workspace</span>
            <h1>Your chess, organized around improvement.</h1>
            <p>Play, review, train, and measure only the activity ChessIQ actually has on this device.</p>
            <div className="premium-hero-actions" aria-label="Primary ChessIQ actions">
              <Link href="/play" className="premium-hero-action">Play now <ChevronRight size={17} /></Link>
              <Link href="/analyze" className="premium-hero-secondary"><Search size={16} /> Analyze a position</Link>
            </div>
            <div className="premium-hero-proof" aria-label="ChessIQ product strengths">
              <span><ShieldCheck size={14} /> First-party engine</span>
              <span><TrendingUp size={14} /> Real local progress</span>
              <span><Activity size={14} /> Play-to-analysis handoff</span>
            </div>
          </div>
        </section>

        <section className="premium-feature-grid" aria-label="ChessIQ product areas">
          {features.map(({ href, title, copy, icon: Icon, accent }) => (
            <Link key={href} href={href} className={`premium-feature-card accent-${accent}`}>
              <span className="premium-feature-icon"><Icon size={24} /></span>
              <strong>{title}</strong>
              <p>{copy}</p>
              <span className="premium-card-link">Open <ChevronRight size={15} /></span>
            </Link>
          ))}
        </section>

        <section className="premium-dashboard-grid">
          <article className="premium-panel premium-activity-panel">
            <header><div><span className="premium-label">Local activity</span><h2>What ChessIQ can verify</h2></div><Activity size={19} /></header>
            <div className="premium-stat-row">
              <div><span>Games saved</span><strong>{snapshot.games}</strong></div>
              <div><span>Moves recorded</span><strong>{snapshot.moves}</strong></div>
              <div><span>Puzzles solved</span><strong>{snapshot.puzzles}</strong></div>
              <div><span>Lessons completed</span><strong>{snapshot.lessons}</strong></div>
            </div>
          </article>

          <article className="premium-panel premium-next-panel">
            <header><div><span className="premium-label">Continue</span><h2>Next best action</h2></div><BarChart3 size={19} /></header>
            <p>{snapshot.games === 0 ? "Play your first game so ChessIQ can start connecting training with real board activity." : "Open Games to revisit a saved position, then carry it straight into Analyze."}</p>
            <Link href={snapshot.games === 0 ? "/play" : "/games"} className="premium-secondary-action">
              {snapshot.games === 0 ? <Gamepad2 size={16} /> : <LibraryBig size={16} />}
              {snapshot.games === 0 ? "Start a game" : "Open games"}
            </Link>
          </article>
        </section>
      </div>
    </main>
  );
}
