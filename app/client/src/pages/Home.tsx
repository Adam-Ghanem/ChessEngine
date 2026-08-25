/**
 * ChessIQ Intelligence in Motion: flagship analysis corridor—position, calculation, evaluation, understanding.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileUp, Moon, Play, RotateCcw, Settings2, SlidersHorizontal, Sun } from "lucide-react";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { AnalysisThread } from "@/components/AnalysisThread";
import { BrandMark } from "@/components/BrandMark";
import { ChessBoard } from "@/components/ChessBoard";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { CriticalMoments } from "@/components/CriticalMoments";
import { EvaluationBar } from "@/components/EvaluationBar";
import { EvaluationGraph } from "@/components/EvaluationGraph";
import { GameReviewCard } from "@/components/GameReviewCard";
import { IQPulse } from "@/components/IQPulse";
import { MoveList } from "@/components/MoveList";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/_core/hooks/useAuth";
import { sampleGame } from "@/data/sampleAnalysis";
import { useTheme } from "@/contexts/ThemeContext";
import type { AnalysisMode } from "@/types/analysis";

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [activeIndex, setActiveIndex] = useState(10);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("beginner");
  const [practiceIndex, setPracticeIndex] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(() => {
    const requestedIndex = Number(new URLSearchParams(window.location.search).get("review"));
    return Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < sampleGame.moves.length ? requestedIndex : null;
  });
  const { theme, toggleTheme } = useTheme();
  const { moves, criticalMoments, opening, title } = sampleGame;
  const currentMove = moves[activeIndex];
  const canGoBack = activeIndex > 0;
  const canGoForward = activeIndex < moves.length - 1;
  const modeLabel = mode === "advanced" ? "Advanced" : "Beginner";
  const practiceMove = practiceIndex === null ? null : moves[practiceIndex];
  const currentPly = activeIndex + 1;

  useEffect(() => {
    if (!isAnalyzing) return undefined;
    const timer = window.setTimeout(() => setIsAnalyzing(false), 2400);
    return () => window.clearTimeout(timer);
  }, [isAnalyzing]);

  const activeMoment = useMemo(() => criticalMoments.find((moment) => moment.moveIndex === activeIndex), [activeIndex, criticalMoments]);

  function selectMove(index: number, revealReview = false) { const nextIndex = Math.max(0, Math.min(moves.length - 1, index)); setActiveIndex(nextIndex); if (revealReview) setReviewIndex(nextIndex); }
  function startAnalysis() { setIsAnalyzing(true); window.setTimeout(() => setReviewIndex(activeIndex), 520); toast("Calculation started for the local sample position."); }
  function startTryAgain(index: number) { setPracticeIndex(index); selectMove(index); }
  function closePractice() { setPracticeIndex(null); }
  function revealPractice() { setPracticeIndex(null); selectMove(Math.min(moves.length - 1, (practiceIndex ?? activeIndex) + 1)); toast("Best continuation revealed in the analysis thread."); }
  function showNextReview() { const next = Math.min(moves.length - 1, (reviewIndex ?? activeIndex) + 1); selectMove(next, true); }
  function shareReview() { toast("ChessIQ insight ready to share when a live game is connected."); }

  return (
    <main className="app-shell chessiq-shell">
      <header className="app-header">
        <BrandMark />
        <nav className="app-nav" aria-label="Primary navigation">
          <button className="nav-item" onClick={() => toast("Play is prepared for the next product increment.")}>Play</button>
          <button className="nav-item is-active" aria-current="page">Analyze</button>
          <button className="nav-item" onClick={() => toast("Learn will use the same ChessIQ system after analysis is connected.")}>Learn</button>
          <button className="nav-item" onClick={() => toast("Puzzle training is planned after the analysis milestone.")}>Puzzles</button>
        </nav>
        <div className="header-engine-state"><IQPulse compact active={isAnalyzing} label={isAnalyzing ? "Engine calculating" : "Engine ready"} /><span>{isAnalyzing ? "Calculating" : "Engine ready"}</span></div>
        <div className="header-actions"><button className="icon-button" aria-label="Open ChessIQ settings" onClick={() => toast("Settings will manage board, engine, sound, and motion preferences.")}><Settings2 size={18} /></button><button className="theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === "dark" ? "Light" : "Dark"}</span></button></div>
      </header>

      <div className="workspace-topline"><div className="crumb-line"><span>ChessIQ Analysis</span><i /><strong>{title} · {opening}</strong></div><div className="workspace-state"><span className="workspace-state-dot" /> Local development sample <span>•</span> Move {currentPly}/{moves.length}</div></div>

      <section className="analysis-workbench">
        <div className="primary-workspace">
          <section className="game-context"><div><p className="eyebrow">ChessIQ Analysis</p><h1>The position changed here.</h1><p className="game-subtitle">Trace the move, see the calculation, understand the consequence.</p></div><div className="mode-switch" role="group" aria-label="Analysis detail mode"><button className={mode === "beginner" ? "is-active" : ""} onClick={() => setMode("beginner")}>Beginner</button><button className={mode === "advanced" ? "is-active" : ""} onClick={() => setMode("advanced")}>Advanced</button></div></section>
          <div className="board-review-stage">{reviewIndex !== null && <GameReviewCard key={reviewIndex} move={moves[reviewIndex]} onClose={() => setReviewIndex(null)} onNext={showNextReview} onShare={shareReview} />}<div className="board-workbench"><EvaluationBar evaluation={currentMove.evaluation} /><ChessBoard fen={currentMove.fen} lastMove={{ from: currentMove.from, to: currentMove.to }} engineArrow={{ from: currentMove.from, to: currentMove.to }} classification={currentMove.classification} showClassificationMarker={reviewIndex === activeIndex} /></div></div>
          <div className="transport-strip" aria-label="Move navigation"><div className="transport-status"><span>PLY</span><strong>{String(currentPly).padStart(2, "0")}</strong><span className="transport-divider" /><strong>{currentMove.san}</strong><ClassificationBadge classification={currentMove.classification} /></div><div className="transport-controls"><button className="transport-button" aria-label="Go to first move" disabled={!canGoBack} onClick={() => selectMove(0)}><ChevronsLeft size={19} /></button><button className="transport-button" aria-label="Previous move" disabled={!canGoBack} onClick={() => selectMove(activeIndex - 1)}><ChevronLeft size={20} /></button><button className="transport-button transport-play" aria-label="Play selected line" onClick={() => toast("Line playback is ready for the live move-state adapter.")}><Play size={16} fill="currentColor" /></button><button className="transport-button" aria-label="Next move" disabled={!canGoForward} onClick={() => selectMove(activeIndex + 1)}><ChevronRight size={20} /></button><button className="transport-button" aria-label="Go to final move" disabled={!canGoForward} onClick={() => selectMove(moves.length - 1)}><ChevronsRight size={19} /></button></div></div>
          <MoveList moves={moves} activeIndex={activeIndex} onSelect={(index) => selectMove(index, ["BRILLIANT", "GREAT", "BEST", "MISTAKE", "BLUNDER"].includes(moves[index].classification))} />
        </div>

        <aside className="analysis-rail">
          <div className="rail-command-row"><button className="primary-action" onClick={startAnalysis}><BarChart3 size={17} />{isAnalyzing ? "Calculating…" : "Analyze position"}</button><button className="rail-icon-button" aria-label="Choose analysis settings" onClick={() => setMode((current) => current === "beginner" ? "advanced" : "beginner")}><SlidersHorizontal size={18} /></button><button className="rail-icon-button" aria-label="Import a PGN" onClick={() => toast("PGN import will be enabled after the game-state adapter is connected.")}><FileUp size={18} /></button><button className="rail-icon-button" aria-label="Export analyzed game" onClick={() => toast("Export becomes available when a live PGN is loaded.")}><Download size={18} /></button></div>
          <AnalysisPanel move={currentMove} mode={mode} isAnalyzing={isAnalyzing} />
          <AnalysisThread move={currentMove} />
          <section className="explanation-panel" aria-labelledby="explanation-heading"><div className="explanation-heading"><p className="eyebrow">ChessIQ explanation</p><span>{modeLabel} view</span></div><ClassificationBadge classification={currentMove.classification} /><h2 id="explanation-heading">{currentMove.fullMove}{currentMove.side === "black" ? "…" : "."} {currentMove.san}</h2><p>{currentMove.explanation}</p><div className="explanation-best-line"><span>Best move</span><strong>{currentMove.bestMove}</strong></div>{activeMoment?.practiceIndex !== undefined && <button className="inline-try-again" onClick={() => startTryAgain(activeMoment.practiceIndex!)}><RotateCcw size={13} />Try again from here</button>}</section>
          <CriticalMoments moves={moves} moments={criticalMoments} activeIndex={activeIndex} onSelect={selectMove} onTryAgain={startTryAgain} />
          <section className="data-boundary-panel"><p className="eyebrow">Data source</p><strong>Local sample study</strong><p>Accuracy and personal coaching appear only after a real game is analyzed.</p></section>
        </aside>

        <EvaluationGraph moves={moves} activeIndex={activeIndex} onSelect={selectMove} />
      </section>

      <footer className="chessiq-footer"><BrandMark compact /><p>Play. Analyze. Learn. Improve.</p><span>Local workspace · Engine bridge pending</span></footer>
      <Sheet open={practiceIndex !== null} onOpenChange={(open) => !open && closePractice()}><SheetContent side="bottom" className="chessiq-sheet"><SheetHeader><p className="eyebrow">ChessIQ practice</p><SheetTitle>Try the position again.</SheetTitle><SheetDescription>{practiceMove ? `Reset to move ${practiceMove.fullMove}${practiceMove.side === "black" ? "…" : "."}. Find the stronger continuation before revealing the engine line.` : "Find the better continuation."}</SheetDescription></SheetHeader><div className="practice-position"><span>POSITION RESET</span><strong>{practiceMove?.fen.split(" ")[0]}</strong></div><div className="practice-actions"><button onClick={closePractice}>Return to analysis</button><button className="practice-primary" onClick={revealPractice}>Reveal best move</button></div></SheetContent></Sheet>
    </main>
  );
}
