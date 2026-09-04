import { useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Gauge, History, SkipForward, Sparkles, Swords } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChessBoard } from "@/components/ChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { analyzePosition, type ServerEngineAnalysis } from "@/engine/serverEngine";
import { validateFenShape } from "@/engine/fen";
import { initialAnalysisFenFromSearch, initialAnalysisGameIdFromSearch } from "@/lib/analysisRoute";
import { readGameHistory, replayMoveContext } from "@/lib/gameHistory";
import { classifyMoveReview, summarizeMoveReviews, type MoveReviewClassification } from "@/lib/gameReview";
import { gameOutcomeLabel } from "@/lib/gameOutcome";
import "@/fen-analyze.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type ReviewedMove = {
  ply: number;
  playedMove: string;
  analysis: ServerEngineAnalysis;
  afterAnalysis: ServerEngineAnalysis | null;
  classification: MoveReviewClassification | null;
};

function moveArrow(move: string | undefined) {
  if (!move || !/^[a-h][1-8][a-h][1-8]/.test(move)) return { from: "a1", to: "a1" };
  return { from: move.slice(0, 2), to: move.slice(2, 4) };
}

function formatMoverScore(scoreCp: number) {
  return `${scoreCp > 0 ? "+" : ""}${(scoreCp / 100).toFixed(2)}`;
}

export default function Analyze() {
  const search = typeof window === "undefined" ? "" : window.location.search;
  const initialFen = useMemo(() => initialAnalysisFenFromSearch(search, START_FEN), [search]);
  const initialGameId = useMemo(() => initialAnalysisGameIdFromSearch(search), [search]);
  const gameContext = useMemo(
    () => initialGameId ? readGameHistory().find(game => game.id === initialGameId) ?? null : null,
    [initialGameId],
  );
  const replayPositions = useMemo(
    () => gameContext?.positions?.length ? gameContext.positions : null,
    [gameContext],
  );
  const [draftFen, setDraftFen] = useState(initialFen);
  const [loadedFen, setLoadedFen] = useState(initialFen);
  const [replayIndex, setReplayIndex] = useState(() => replayPositions ? replayPositions.length - 1 : 0);
  const [depth, setDepth] = useState(6);
  const [analysis, setAnalysis] = useState<ServerEngineAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moveReviews, setMoveReviews] = useState<Record<number, ReviewedMove>>({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const selectedMoveContext = useMemo(
    () => gameContext ? replayMoveContext(gameContext, replayIndex) : null,
    [gameContext, replayIndex],
  );
  const visibleMoveReview = selectedMoveContext ? moveReviews[selectedMoveContext.ply] ?? null : null;
  const reviewSummary = useMemo(
    () => summarizeMoveReviews(Object.values(moveReviews).map(review => review.classification)),
    [moveReviews],
  );
  const moveReviewMatchesEngine = visibleMoveReview
    ? visibleMoveReview.playedMove.toLowerCase() === visibleMoveReview.analysis.bestMove.toLowerCase()
    : false;

  const bestArrow = useMemo(() => {
    if (!analysis || !/^[a-h][1-8][a-h][1-8]/.test(analysis.bestMove)) return { from: "a1", to: "a1" };
    return { from: analysis.bestMove.slice(0, 2), to: analysis.bestMove.slice(2, 4) };
  }, [analysis]);
  const replayArrow = useMemo(
    () => replayPositions ? moveArrow(gameContext?.moves[replayIndex - 1]) : { from: "a1", to: "a1" },
    [gameContext, replayIndex, replayPositions],
  );

  function loadPosition() {
    const validation = validateFenShape(draftFen);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setLoadedFen(validation.fen);
    setAnalysis(null);
    setError(null);
    toast.success("Position loaded.");
  }

  function selectReplayPosition(nextIndex: number) {
    if (!replayPositions) return;
    const safeIndex = Math.min(Math.max(nextIndex, 0), replayPositions.length - 1);
    const position = replayPositions[safeIndex];
    setReplayIndex(safeIndex);
    setDraftFen(position);
    setLoadedFen(position);
    setAnalysis(null);
    setError(null);
    setReviewError(null);
  }

  function cacheMoveReview(review: ReviewedMove) {
    setMoveReviews(current => ({ ...current, [review.ply]: review }));
  }

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePosition(loadedFen, depth);
      setAnalysis(result);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "ChessEngine analysis failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function reviewSelectedMove() {
    if (!selectedMoveContext || !replayPositions) return;
    const positionAfterFen = replayPositions[selectedMoveContext.ply];
    if (!positionAfterFen) return;

    setReviewLoading(true);
    setReviewError(null);
    try {
      const beforeAnalysis = await analyzePosition(selectedMoveContext.positionBeforeFen, depth);
      const bestMoveMatch = selectedMoveContext.playedMove.toLowerCase() === beforeAnalysis.bestMove.toLowerCase();

      if (bestMoveMatch) {
        cacheMoveReview({
          ply: selectedMoveContext.ply,
          playedMove: selectedMoveContext.playedMove,
          analysis: beforeAnalysis,
          afterAnalysis: null,
          classification: classifyMoveReview({ bestMoveMatch: true, beforeScoreCp: beforeAnalysis.scoreCp, afterScoreCp: 0 }),
        });
        return;
      }

      try {
        const afterAnalysis = await analyzePosition(positionAfterFen, depth);
        cacheMoveReview({
          ply: selectedMoveContext.ply,
          playedMove: selectedMoveContext.playedMove,
          analysis: beforeAnalysis,
          afterAnalysis,
          classification: classifyMoveReview({
            bestMoveMatch: false,
            beforeScoreCp: beforeAnalysis.scoreCp,
            afterScoreCp: afterAnalysis.scoreCp,
          }),
        });
      } catch {
        cacheMoveReview({
          ply: selectedMoveContext.ply,
          playedMove: selectedMoveContext.playedMove,
          analysis: beforeAnalysis,
          afterAnalysis: null,
          classification: null,
        });
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "ChessEngine move review failed";
      setReviewError(message);
      toast.error(message);
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell fen-analyze-shell">
        <ProductHeader activePath="/analyze" />

        <section className="analysis-hero fen-analyze-hero">
          <div className="analysis-hero-copy">
            <div className="analysis-hero-kicker"><Sparkles size={14} /> Live ChessEngine</div>
            <h1>{gameContext ? "Review your saved game position." : "Analyze any position."}</h1>
            <p>{gameContext ? "ChessIQ keeps the saved-game context with this position, so you can replay recorded positions and ask the live first-party engine what it preferred before any recorded move." : "Load a FEN and run the first-party ChessEngine directly against that position. No sample score replaces the live result."}</p>
          </div>
          <div className="analysis-hero-meta" aria-label="Analyze status">
            <div><span>Depth</span><strong>{depth}</strong></div>
            <div><span>Engine</span><strong>{analysis?.engine ?? visibleMoveReview?.analysis.engine ?? "ChessEngine"}</strong></div>
            <div className={loading || reviewLoading ? "engine-status is-live" : "engine-status"}><span>Status</span><strong>{loading || reviewLoading ? "Calculating" : analysis || visibleMoveReview ? "Complete" : "Ready"}</strong></div>
          </div>
        </section>

        <section className="fen-analyze-layout">
          <div className="analysis-board-card fen-board-card">
            <div className="analysis-card-header">
              <div><span className="analysis-label">Loaded position</span><h2>Board</h2></div>
              <Link href={gameContext ? "/games" : "/play"} className="fen-review-link">{gameContext ? "Back to Games" : "Open Play"}</Link>
            </div>
            <div className="analysis-board-stage">
              <div className="analysis-board-wrap fen-board-wrap">
                <ChessBoard fen={loadedFen} lastMove={replayPositions ? replayArrow : { from: "a1", to: "a1" }} engineArrow={bestArrow} />
              </div>
            </div>
          </div>

          <aside className="fen-analyze-rail">
            {gameContext && (
              <section className="analysis-command-card game-review-context" aria-labelledby="game-review-context-title">
                <div className="analysis-section-heading compact">
                  <div><span className="analysis-label">Saved game</span><h2 id="game-review-context-title">Review context</h2></div>
                  <History size={18} />
                </div>
                <div className="game-review-facts">
                  <div><span>Mode</span><strong>{gameContext.mode === "computer" ? "vs ChessIQ" : "Local board"}</strong></div>
                  <div><span>Status</span><strong>{gameOutcomeLabel(gameContext)}</strong></div>
                  <div><span>Moves</span><strong>{gameContext.moves.length} ply</strong></div>
                </div>
                <div className="game-review-moves">
                  <span><Swords size={14} /> Recent moves</span>
                  <p>{gameContext.moves.length ? gameContext.moves.slice(-8).join(" · ") : "No recorded moves"}</p>
                </div>
                {reviewSummary.reviewed > 0 && (
                  <div className="game-review-facts game-review-session-summary" aria-label="Reviewed move summary" aria-live="polite">
                    <div><span>Classified</span><strong>{reviewSummary.reviewed} / {gameContext.moves.length}</strong></div>
                    <div><span>Average CPL</span><strong>{reviewSummary.averageCentipawnLoss}</strong></div>
                    <div><span>Errors</span><strong>{reviewSummary.inaccuracies + reviewSummary.mistakes + reviewSummary.blunders}</strong></div>
                  </div>
                )}
                {replayPositions ? (
                  <div
                    className="game-review-replay"
                    aria-label="Saved game replay"
                    aria-describedby="game-review-keyboard-hint"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      let nextIndex: number | null = null;
                      if (event.key === "ArrowLeft") nextIndex = replayIndex - 1;
                      if (event.key === "ArrowRight") nextIndex = replayIndex + 1;
                      if (event.key === "Home") nextIndex = 0;
                      if (event.key === "End") nextIndex = replayPositions.length - 1;
                      if (nextIndex === null) return;
                      event.preventDefault();
                      selectReplayPosition(nextIndex);
                    }}
                  >
                    <div className="game-review-replay-status" aria-live="polite">
                      <span>Replay position</span>
                      <strong>{replayIndex} / {Math.max(0, replayPositions.length - 1)}</strong>
                    </div>
                    <p id="game-review-keyboard-hint" className="game-review-keyboard-hint">Keyboard: ←/→ step · Home start · End final</p>
                    {gameContext.moves.length > 0 && (
                      <div className="game-review-move-timeline" role="list" aria-label="Recorded move timeline">
                        {gameContext.moves.map((move, index) => {
                          const reviewed = moveReviews[index + 1]?.classification;
                          const isCurrent = replayIndex === index + 1;
                          return (
                            <button
                              key={`${index}-${move}`}
                              type="button"
                              role="listitem"
                              onClick={() => selectReplayPosition(index + 1)}
                              aria-label={`Jump to position ${index + 1} after ${move}${reviewed ? `. Reviewed: ${reviewed.label}, ${reviewed.centipawnLoss} centipawn loss` : ""}`}
                              aria-current={isCurrent ? "step" : undefined}
                              className={`${isCurrent ? "is-current" : ""}${reviewed ? " is-reviewed" : ""}`.trim()}
                            >
                              <span>{index + 1}</span>
                              <strong>{move}</strong>
                              {reviewed && <em className="game-review-timeline-verdict">{reviewed.label}</em>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="game-review-replay-actions">
                      <button type="button" onClick={() => selectReplayPosition(replayIndex - 1)} disabled={replayIndex === 0} aria-label="Previous position"><ChevronLeft size={16} /> Previous</button>
                      <button type="button" onClick={() => selectReplayPosition(replayIndex + 1)} disabled={replayIndex >= replayPositions.length - 1} aria-label="Next position">Next <ChevronRight size={16} /></button>
                    </div>
                    <button type="button" className="game-review-final-action" onClick={() => selectReplayPosition(replayPositions.length - 1)} disabled={replayIndex === replayPositions.length - 1} aria-label="Back to final position"><SkipForward size={15} /> Back to final position</button>

                    <div className="game-review-engine-check" aria-live="polite">
                      <div>
                        <span className="analysis-label">Selected move</span>
                        <strong>{selectedMoveContext ? `${selectedMoveContext.ply}. ${selectedMoveContext.playedMove}` : "Choose a recorded move"}</strong>
                      </div>
                      <button type="button" className="game-review-engine-action" onClick={reviewSelectedMove} disabled={!selectedMoveContext || reviewLoading}>
                        <Sparkles size={15} /> {reviewLoading ? "Reviewing…" : visibleMoveReview ? "Re-review selected move" : "Review selected move"}
                      </button>
                      {reviewError && <p className="analysis-inline-error" role="alert">{reviewError}</p>}
                      {visibleMoveReview && (
                        <div className={`game-review-engine-result ${moveReviewMatchesEngine ? "is-match" : "is-alternative"}`}>
                          <div><span>Played</span><strong>{visibleMoveReview.playedMove}</strong></div>
                          <div><span>Engine choice</span><strong>{visibleMoveReview.analysis.bestMove}</strong></div>
                          <div><span>Verdict</span><strong>{visibleMoveReview.classification?.label ?? (moveReviewMatchesEngine ? "Best move" : "Engine preferred another move")}</strong></div>
                          <div><span>Centipawn loss</span><strong>{visibleMoveReview.classification ? visibleMoveReview.classification.centipawnLoss : "Unavailable"}</strong></div>
                          <div><span>Eval before move</span><strong>{formatMoverScore(visibleMoveReview.analysis.scoreCp)}</strong></div>
                          <div><span>Eval after move</span><strong>{visibleMoveReview.afterAnalysis ? formatMoverScore(-visibleMoveReview.afterAnalysis.scoreCp) : moveReviewMatchesEngine ? "Same best line" : "Unavailable"}</strong></div>
                          <p>Depth {visibleMoveReview.analysis.depth} · PV {visibleMoveReview.analysis.principalVariation || "not returned"}</p>
                          <p>Move-loss thresholds: ≤20 Excellent · ≤50 Good · ≤100 Inaccuracy · ≤200 Mistake · &gt;200 Blunder. Scores are normalized to the player who made the move.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="game-review-legacy-note">This older saved game predates replay history. Its final position is still available for analysis.</p>
                )}
              </section>
            )}

            <section className="analysis-command-card">
              <div className="analysis-section-heading">
                <div><span className="analysis-label">Position input</span><h2>FEN</h2></div>
                <Gauge size={19} />
              </div>
              <label className="fen-field">
                <span>Position</span>
                <textarea value={draftFen} onChange={(event) => setDraftFen(event.target.value)} rows={4} spellCheck={false} aria-describedby="fen-help" />
              </label>
              <p id="fen-help" className="fen-help">Paste a standard six-field FEN. The server remains the final validation authority.</p>
              <button className="fen-secondary-action" type="button" onClick={loadPosition}>Load position</button>
            </section>

            <section className="analysis-command-card">
              <div className="analysis-section-heading compact"><div><span className="analysis-label">Search controls</span><h2>Analyze</h2></div><BarChart3 size={18} /></div>
              <label className="fen-depth-field">
                <span>Depth</span>
                <input type="range" min="1" max="10" value={depth} onChange={(event) => setDepth(Number(event.target.value))} aria-valuetext={`Depth ${depth}`} />
                <strong>{depth}</strong>
              </label>
              <button className="primary-action analysis-primary-action" type="button" onClick={runAnalysis} disabled={loading}>
                <BarChart3 size={17} /> {loading ? "Calculating…" : "Analyze position"}
              </button>
              {error && <p className="analysis-inline-error" role="alert">{error}</p>}
            </section>

            <section className="analysis-insight-card fen-result-card" aria-live="polite">
              <div className="analysis-section-heading compact"><div><span className="analysis-label">Live result</span><h2>Engine line</h2></div><Sparkles size={18} /></div>
              {analysis ? (
                <div className="fen-result-grid">
                  <div><span>Best move</span><strong>{analysis.bestMove}</strong></div>
                  <div><span>Evaluation</span><strong>{(analysis.scoreCp / 100).toFixed(2)}</strong></div>
                  <div><span>Depth</span><strong>{analysis.depth}</strong></div>
                  <div className="fen-pv"><span>Principal variation</span><strong>{analysis.principalVariation || "Not returned"}</strong></div>
                </div>
              ) : (
                <p>Run analysis to see the live best move, evaluation, depth, and principal variation.</p>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
