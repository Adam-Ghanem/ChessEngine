import { Activity, BrainCircuit, Trophy } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";

export default function ProgressPage() {
  const { isAuthenticated } = useAuth();
  const games = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated });
  const progress = trpc.learn.progress.useQuery(undefined, { enabled: isAuthenticated });
  const attempts = trpc.puzzles.attempts.useQuery(undefined, { enabled: isAuthenticated });
  const analyses = trpc.analysis.list.useQuery(undefined, { enabled: isAuthenticated });
  const solved = attempts.data?.filter(item => item.result === "solved").length ?? 0;
  const completed = progress.data?.filter(item => item.status === "completed").length ?? 0;
  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page"><div className="product-intro"><p className="eyebrow">ChessIQ progress</p><h1>Progress measured from your own work.</h1><p>No invented ratings or testimonials: this screen summarizes saved games, actual engine sessions, learning checkpoints, and puzzle attempts.</p></div>{!isAuthenticated ? <section className="auth-gate"><Activity size={28}/><h2>Sign in to build your progress record.</h2><button className="account-button account-primary" onClick={() => startLogin()}>Sign in</button></section> : <div className="metric-grid"><article><Activity size={20}/><span>Saved games</span><strong>{games.data?.length ?? 0}</strong></article><article><BrainCircuit size={20}/><span>Engine sessions</span><strong>{analyses.data?.length ?? 0}</strong></article><article><Trophy size={20}/><span>Puzzles solved</span><strong>{solved}</strong></article><article><Trophy size={20}/><span>Lessons complete</span><strong>{completed}</strong></article></div>}</section></main>;
}
