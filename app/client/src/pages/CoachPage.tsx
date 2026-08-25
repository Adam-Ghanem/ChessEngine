import { ArrowRight, BrainCircuit, Compass, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { ProductHeader } from "@/components/ProductHeader";
import { trpc } from "@/lib/trpc";

export default function CoachPage() {
  const { isAuthenticated } = useAuth();
  const games = trpc.games.list.useQuery(undefined, { enabled: isAuthenticated });
  const analysis = trpc.analysis.list.useQuery(undefined, { enabled: isAuthenticated });
  const lessons = trpc.learn.progress.useQuery(undefined, { enabled: isAuthenticated });
  const puzzles = trpc.puzzles.attempts.useQuery(undefined, { enabled: isAuthenticated });
  const solved = puzzles.data?.filter(item => item.result === "solved").length ?? 0;
  const completedLessons = lessons.data?.filter(item => item.status === "completed").length ?? 0;
  const recommendation = !games.data?.length
    ? { title: "Start a first saved game", copy: "A real game gives ChessIQ a position, a PGN, and a starting point for your review.", href: "/play", label: "Open Play" }
    : !analysis.data?.length
      ? { title: "Review your latest position", copy: "Run a bounded ChessEngine search and save the principal variation before you decide what to practise.", href: "/analyze", label: "Open Analyze" }
      : !solved
        ? { title: "Test one tactical idea", copy: "Use a short puzzle attempt to turn the analysis habit into a board decision.", href: "/puzzles", label: "Open Puzzles" }
        : { title: "Continue a learning path", copy: "Complete a focused lesson checkpoint and ChessIQ will retain it in your own progress record.", href: "/learn", label: "Open Learn" };
  return <main className="app-shell chessiq-shell"><ProductHeader /><section className="product-page"><div className="product-intro"><p className="eyebrow">ChessIQ coach</p><h1>One clear next step, based on your own board work.</h1><p>The Coach does not invent a rating. It uses the games, engine sessions, lessons, and puzzle attempts stored in your account to guide the next action.</p></div>{!isAuthenticated ? <section className="auth-gate"><BrainCircuit size={28}/><h2>Sign in to activate your Coach.</h2><p>ChessIQ only creates recommendations from your own saved activity.</p><button className="account-button account-primary" onClick={() => startLogin()}>Sign in</button></section> : <div className="coach-grid"><article className="coach-recommendation"><Sparkles size={24}/><p className="eyebrow">Recommended now</p><h2>{recommendation.title}</h2><p>{recommendation.copy}</p><Link href={recommendation.href} className="product-action product-action-violet">{recommendation.label}<ArrowRight size={15}/></Link></article><section className="coach-signal-list"><article><Compass size={18}/><span>Saved games</span><strong>{games.data?.length ?? 0}</strong></article><article><BrainCircuit size={18}/><span>Engine sessions</span><strong>{analysis.data?.length ?? 0}</strong></article><article><Sparkles size={18}/><span>Puzzles solved</span><strong>{solved}</strong></article><article><Compass size={18}/><span>Lessons complete</span><strong>{completedLessons}</strong></article></section></div>}</section></main>;
}
