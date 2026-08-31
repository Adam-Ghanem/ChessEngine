/**
 * ChessIQ analysis workspace — board-first product experience.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileUp,
  Gauge,
  Moon,
  Play,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
} from "lucide-react";
import { AnalysisPanel, type LiveEngineAnalysis } from "@/components/AnalysisPanel";
import { AnalysisThread } from "@/components/AnalysisThread";
import { BrandMark } from "@/components/BrandMark";
import { ChessBoard } from "@/components/ChessBoard";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import { CriticalMoments } from "@/components/CriticalMoments";
import { EvaluationBar } from "@/components/EvaluationBar";
import { EvaluationGraph } from "@/components/EvaluationGraph";
import { GameReviewCard } from "@/components/GameReviewCard";
import { MoveList } from "@/components/MoveList";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { sampleGame } from "@/data/sampleAnalysis";
import { useTheme } from "@/contexts/ThemeContext";
import type { AnalysisMode } from "@/types/analysis";

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(10);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [engineAnalysis, setEngineAnalysis] = useState<{ moveIndex: number; result: LiveEngineAnalysis } | null>(null);
  const [mode, setMode] = useState<AnalysisMode>("beginner");
  const [practiceIndex, setPracticeIndex] = useState<number | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(() => {
    const requestedIndex = Number(new URLSearchParams(window.location.search).get("review"));
    return Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < sampleGame.moves.length
      ? requestedIndex
      : null;
  });

  const { theme, toggleTheme } = useTheme();
  const { moves, criticalMoments, opening, title } = sampleGame;
  const currentMove = moves[activeIndex];
  const currentPly = activeIndex + 1;
  const canGoBack = activeIndex > 0;
  const canGoForward = activeIndex < moves.length - 1;
  const modeLabel = mode === "advanced" ? "Advanced" : "Beginner";
  const practiceMove = practiceIndex === null ? null : moves[practiceIndex];
  const liveAnalysis = engineAnalysis?.moveIndex === activeIndex ? engineAnalysis.result : null;
  const liveScore = liveAnalysis ? liveAnalysis.scoreCp / 100 : currentMove.evaluation.score;
  const liveBestMove = liveAnalysis?.bestMove ?? currentMove.bestMove;
  const liveArrow = liveAnalysis && /^[a-h][1-8][a-h][1-8]/.test(liveAnalysis.bestMove)
    ? { from: liveAnalysis.bestMove.slice(0, 2), to: liveAnalysis.bestMove.slice(2, 4) }
    : { from: currentMove.from, to: currentMove.to };

  const activeMoment = useMemo(
    () => criticalMoments.find((moment) => moment.moveIndex === activeIndex),
    [activeIndex, criticalMoments],
  );

  function selectMove(index: number, revealReview = false) {
    const nextIndex = Math.max(0, Math.min(moves.length - 1, index));
    setActiveIndex(nextIndex);
    setAnalysisError(null);
    if (revealReview) setReviewIndex(nextIndex);
  }

  async function startAnalysis() {
    if (isAnalyzing) return;
    const analyzedIndex = activeIndex;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: currentMove.fen, depth: mode === "advanced" ? 8 : 5 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "ChessEngine analysis failed");

      const result = payload as LiveEngineAnalysis;
      setEngineAnalysis({ moveIndex: analyzedIndex, result });
      setReviewIndex(analyzedIndex);
      toast.success(`ChessEngine found ${result.bestMove} at depth ${result.depth}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "ChessEngine analysis failed";
      setAnalysisError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function startTryAgain(index: number) {
    setPracticeIndex(index);
    selectMove(index);
  }

  function closePractice() {
    setPracticeIndex(null);
  }

  function revealPractice() {
    setPracticeIndex(null);
    selectMove(Math.min(moves.length - 1, (practiceIndex ?? activeIndex) + 1));
    toast("Best continuation revealed.");
  }

  function showNextReview() {
    const next = Math.min(moves.length - 1, (reviewIndex ?? activeIndex) + 1);
    selectMove(next, true);
  }

  function shareReview() {
    toast("Share export will be available from saved analysis.");
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell">
        <header className="app-header product-header">
          <BrandMark />
          <nav className="app-nav" aria-label="Primary navigation">
            <button className="nav-item" onClick={() => toast("Play workspace is coming next.")}>Play</button>
            <button className="nav-item is-active" aria-current="page">Analyze</button>
            <button className="nav-item" onClick={() => toast("Learning workspace is coming next.")}>Learn</button>
            <button className="nav-item" onClick={() => toast("Puzzle training is coming next.")}>Puzzles</button>
          </nav>
          <div className="header-actions">
            <button className="icon-button" aria-label="Open ChessIQ settings" onClick={() => toast("Settings panel is coming next.")}>
              <Settings2 size={18} />
            </button>
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

        <section className="analysis-hero">
          <div className="analysis-hero-copy">
            <div className="analysis-hero-kicker"><Sparkles size={14} /> ChessIQ Review</div>
            <h1>Understand every move.</h1>
            <p>Navigate the game, inspect the engine line, and turn each critical position into something you can learn from.</p>
          </div>
          <div className="analysis-hero-meta" aria-label="Current analysis status">
            <div>
              <span>Position</span>
              <strong>{currentPly}/{moves.length}</strong>
            </div>
            <div>
              <span>Opening</span>
              <strong>{opening}</strong>
            </div>
            <div className={isAnalyzing ? "engine-status is-live" : "engine-status"}>
              <span>Engine</span>
              <strong>{isAnalyzing ? "Calculating" : liveAnalysis ? `Live · d${liveAnalysis.depth}` : "Ready"}</strong>
            </div>
          </div>
        </section>

        <div className="analysis-layout">
          <section className="analysis-main-column">
            <section className="analysis-board-card">
              <header className="analysis-card-header">
                <div>
                  <span className="analysis-label">Current position</span>
                  <h2>{title}</h2>
                </div>
                <div className="mode-switch" role="group" aria-label="Analysis detail mode">
                  <button className={mode === "beginner" ? "is-active" : ""} onClick={() => setMode("beginner")}>Beginner</button>
                  <button className={mode === "advanced" ? "is-active" : ""} onClick={() => setMode("advanced")}>Advanced</button>
                </div>
              </header>

              <div className="analysis-board-stage">
                <div className="analysis-board-wrap">
                  <EvaluationBar evaluation={{ ...currentMove.evaluation, score: liveScore }} />
                  <ChessBoard
                    fen={currentMove.fen}
                    lastMove={{ from: currentMove.from, to: currentMove.to }}
                    engineArrow={liveArrow}
                    classification={currentMove.classification}
                    showClassificationMarker={reviewIndex === activeIndex}
                  />
                </div>
              </div>

              <div className="analysis-transport" aria-label="Move navigation">
                <div className="analysis-move-summary">
                  <span>Move {currentMove.fullMove}{currentMove.side === "black" ? "…" : "."}</span>
                  <strong>{currentMove.san}</strong>
                  <ClassificationBadge classification={currentMove.classification} />
                </div>
                <div className="transport-controls">
                  <button className="transport-button" aria-label="Go to first move" disabled={!canGoBack} onClick={() => selectMove(0)}><ChevronsLeft size={19} /></button>
                  <button className="transport-button" aria-label="Previous move" disabled={!canGoBack} onClick={() => selectMove(activeIndex - 1)}><ChevronLeft size={20} /></button>
                  <button className="transport-button transport-play" aria-label="Review selected position" onClick={() => setReviewIndex(activeIndex)}><Play size={16} fill="currentColor" /></button>
                  <button className="transport-button" aria-label="Next move" disabled={!canGoForward} onClick={() => selectMove(activeIndex + 1)}><ChevronRight size={20} /></button>
                  <button className="transport-button" aria-label="Go to final move" disabled={!canGoForward} onClick={() => selectMove(moves.length - 1)}><ChevronsRight size={19} /></button>
                </div>
              </div>

              {reviewIndex !== null && (
                <div className="analysis-review-inline">
                  <GameReviewCard
                    key={reviewIndex}
                    move={moves[reviewIndex]}
                    onClose={() => setReviewIndex(null)}
                    onNext={showNextReview}
                    onShare={shareReview}
                  />
                </div>
              )}
            </section>

            <section className="analysis-moves-card">
              <div className="analysis-section-heading">
                <div><span className="analysis-label">Game timeline</span><h2>Moves</h2></div>
                <span>{moves.length} ply</span>
              </div>
              <MoveList
                moves={moves}
                activeIndex={activeIndex}
                onSelect={(index) => selectMove(index, ["BRILLIANT", "GREAT", "BEST", "MISTAKE", "BLUNDER"].includes(moves[index].classification))}
              />
            </section>
          </section>

          <aside className="analysis-side-stack">
            <section className="analysis-command-card">
              <div className="analysis-section-heading">
                <div><span className="analysis-label">Engine review</span><h2>Analyze</h2></div>
                <Gauge size={19} />
              </div>
              <button className="primary-action analysis-primary-action" onClick={startAnalysis} disabled={isAnalyzing}>
                <BarChart3 size={17} />
                {isAnalyzing ? "Calculating…" : liveAnalysis ? "Analyze again" : "Analyze position"}
              </button>
              {analysisError && <p className="analysis-inline-error" role="alert">{analysisError}</p>}
              <div className="analysis-quick-actions">
                <button aria-label="Toggle analysis detail" onClick={() => setMode((current) => current === "beginner" ? "advanced" : "beginner")}><SlidersHorizontal size={17} /> Detail</button>
                <button aria-label="Import a PGN" onClick={() => toast("PGN import will be available from the Games workspace.")}><FileUp size={17} /> Import</button>
                <button aria-label="Export analyzed game" onClick={() => toast("Export will be available after an analysis is saved.")}><Download size={17} /> Export</button>
              </div>
            </section>

            <AnalysisPanel move={currentMove} mode={mode} isAnalyzing={isAnalyzing} liveAnalysis={liveAnalysis} />

            <section className="analysis-insight-card" aria-labelledby="explanation-heading">
              <div className="analysis-section-heading compact">
                <div><span className="analysis-label">ChessIQ insight</span><h2 id="explanation-heading">Why this move matters</h2></div>
                <Target size={18} />
              </div>
              <div className="analysis-insight-title">
                <ClassificationBadge classification={currentMove.classification} />
                <strong>{currentMove.fullMove}{currentMove.side === "black" ? "…" : "."} {currentMove.san}</strong>
              </div>
              <p>{liveAnalysis ? `Live ChessEngine search at depth ${liveAnalysis.depth}. Principal variation: ${liveAnalysis.principalVariation || "not returned"}.` : currentMove.explanation}</p>
              <div className="analysis-best-move"><span>Best move</span><strong>{liveBestMove}</strong></div>
              {activeMoment?.practiceIndex !== undefined && (
                <button className="inline-try-again" onClick={() => startTryAgain(activeMoment.practiceIndex!)}><RotateCcw size={13} /> Try again from here</button>
              )}
            </section>

            <AnalysisThread move={currentMove} />
            <CriticalMoments moves={moves} moments={criticalMoments} activeIndex={activeIndex} onSelect={selectMove} onTryAgain={startTryAgain} />

            <section className="analysis-graph-card">
              <div className="analysis-section-heading compact">
                <div><span className="analysis-label">Evaluation</span><h2>Game trend</h2></div>
                <span>{modeLabel}</span>
              </div>
              <EvaluationGraph moves={moves} activeIndex={activeIndex} onSelect={selectMove} />
            </section>
          </aside>
        </div>

        <footer className="chessiq-footer product-footer">
          <BrandMark compact />
          <p>Play. Analyze. Learn. Improve.</p>
          <span>ChessIQ analysis workspace</span>
        </footer>
      </div>

      <Sheet open={practiceIndex !== null} onOpenChange={(open) => !open && closePractice()}>
        <SheetContent side="bottom" className="chessiq-sheet">
          <SheetHeader>
            <p className="eyebrow">ChessIQ practice</p>
            <SheetTitle>Try the position again.</SheetTitle>
            <SheetDescription>
              {practiceMove
                ? `Reset to move ${practiceMove.fullMove}${practiceMove.side === "black" ? "…" : "."}. Find the stronger continuation before revealing the engine line.`
                : "Find the better continuation."}
            </SheetDescription>
          </SheetHeader>
          <div className="practice-position"><span>POSITION RESET</span><strong>{practiceMove?.fen.split(" ")[0]}</strong></div>
          <div className="practice-actions"><button onClick={closePractice}>Return to analysis</button><button className="practice-primary" onClick={revealPractice}>Reveal best move</button></div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
