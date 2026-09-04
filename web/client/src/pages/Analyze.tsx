import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Gauge, History, SkipForward, Sparkles, Swords } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChessBoard } from "@/components/ChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { analyzePosition, type ServerEngineAnalysis } from "@/engine/serverEngine";
import { validateFenShape } from "@/engine/fen";
import { initialAnalysisFenFromSearch, initialAnalysisGameIdFromSearch } from "@/lib/analysisRoute";
import { readGameHistory, replayMoveContext } from "@/lib/gameHistory";
import { classifyMoveReview, pendingReviewPlies, rankCriticalReviewMoments, summarizeMoveReviews, summarizeMoveReviewsBySide, type MoveReviewClassification } from "@/lib/gameReview";
import { readGameReviewCache, writeGameReviewCache } from "@/lib/gameReviewCache";
import { gameOutcomeLabel } from "@/lib/gameOutcome";
import "@/fen-analyze.css";
import "@/game-review-side-performance.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type ReviewedMove = {
  ply: number;
  playedMove: string;
  analysis: ServerEngineAnalysis;
  afterAnalysis: ServerEngineAnalysis | null;
  classification: MoveReviewClassification | null;
};

type ReviewAllProgress = {
  completed: number;
  total: number;
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
  const [reviewAllProgress, setReviewAllProgress] = useState<ReviewAllProgress | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameContext || typeof window === "undefined") {
      setMoveReviews({});
      return;
    }
    setMoveReviews(readGameReviewCache(window.localStorage, gameContext.id, depth, gameContext.moves));
  }, [gameContext, depth]);

  const selectedMoveContext = useMemo(
    () => gameContext ? replayMoveContext(gameContext, replayIndex) : null,
    [gameContext, replayIndex],
  );
  const visibleMoveReview = selectedMoveContext ? moveReviews[selectedMoveContext.ply] ?? null : null;
  const reviewSummary = useMemo(
    () => summarizeMoveReviews(Object.values(moveReviews).map(review => review.classification)),
    [moveReviews],
  );
  const sideReviewSummary = useMemo(
    () => summarizeMoveReviewsBySide(
      Object.values(moveReviews).map(review => ({ ply: review.ply, classification: review.classification })),
    ),
    [moveReviews],
  );
  const criticalReviewMoments = useMemo(
    () => rankCriticalReviewMoments(
      Object.values(moveReviews).map(review => ({ ply: review.ply, classification: review.classification })),
      3,
    ),
    [moveReviews],
  );
  const remainingReviewPlies = useMemo(
    () => pendingReviewPlies(gameContext?.moves.length ?? 0, Object.keys(moveReviews).map(Number)),
    [gameContext, moveReviews],
  );
  const reviewBusy = reviewLoading || reviewAllProgress !== null;
  const moveReviewMatchesEngine = visibleMoveReview
    ? visibleMoveReview.playedMove.toLowerCase() === visibleMoveReview.analysis.bestMove.toLowerCase()
    : false;
  const whiteSideLabel = gameContext?.mode === "computer"
    ? gameContext.playerSide === "white" ? "You" : "ChessIQ"
    : "White";
  const blackSideLabel = gameContext?.mode === "computer"
    ? gameContext.playerSide === "black" ? "You" : "ChessIQ"
    : "Black";

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
    setMoveReviews(current => {
      const next = { ...current, [review.ply]: review };
      if (gameContext && typeof window !== "undefined") {
        writeGameReviewCache(window.localStorage, gameContext.id, depth, gameContext.moves, next);
      }
      return next;
    });
  }

  async function analyzeRecordedMove(ply: number): Promise<ReviewedMove | null> {
    if (!gameContext || !replayPositions) return null;
    const context = replayMoveContext(gameContext, ply);
    const positionAfterFen = replayPositions[ply];
    if (!context || !positionAfterFen) return null;

    const beforeAnalysis = await analyzePosition(context.positionBeforeFen, depth);
    const bestMoveMatch = context.playedMove.toLowerCase() === beforeAnalysis.bestMove.toLowerCase();
    if (bestMoveMatch) {
      return {
        ply: context.ply,
        playedMove: context.playedMove,
        analysis: beforeAnalysis,
        afterAnalysis: null,
        classification: classifyMoveReview({ bestMoveMatch: true, beforeScoreCp: beforeAnalysis.scoreCp, afterScoreCp: 0 }),
      };
    }

    try {
      const afterAnalysis = await analyzePosition(positionAfterFen, depth);
      return {
        ply: context.ply,
        playedMove: context.playedMove,
        analysis: beforeAnalysis,
        afterAnalysis,
        classification: classifyMoveReview({
          bestMoveMatch: false,
          beforeScoreCp: beforeAnalysis.scoreCp,
          afterScoreCp: afterAnalysis.scoreCp,
        }),
      };
    } catch {
      return {
        ply: context.ply,
        playedMove: context.playedMove,
        analysis: beforeAnalysis,
        afterAnalysis: null,
        classification: null,
      };
    }
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

    setReviewLoading(true);
    setReviewError(null);
    try {
      const review = await analyzeRecordedMove(selectedMoveContext.ply);
      if (review) cacheMoveReview(review);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "ChessEngine move review failed";
      setReviewError(message);
      toast.error(message);
    } finally {
      setReviewLoading(false);
    }
  }

  async function reviewRemainingMoves() {
    if (!gameContext || !replayPositions || remainingReviewPlies.length === 0) return;

    const queue = [...remainingReviewPlies];
    setReviewError(null);
    setReviewAllProgress({ completed: 0, total: queue.length });
    try {
      for (let index = 0; index < queue.length; index += 1) {
        const review = await analyzeRecordedMove(queue[index]);
        if (review) cacheMoveReview(review);
        setReviewAllProgress({ completed: index + 1, total: queue.length });
      }
      toast.success(`Reviewed ${queue.length} saved-game move${queue.length === 1 ? "" : "s"}.`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "ChessEngine full game review failed";
      setReviewError(`Full review stopped: ${message}`);
      toast.error(message);
    } finally {
      setReviewAllProgress(null);
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
            <div className={loading || reviewBusy ? "engine-status is-live" : "engine-status"}><span>Status</span><strong>{loading || reviewBusy ? "Calculating" : analysis || visibleMoveReview ? "Complete" : "Ready"}</strong></div>
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
                  <>
                    <div className="game-review-facts game-review-session-summary" aria-label="Reviewed move summary" aria-live="polite">
                      <div><span>Classified</span><strong>{reviewSummary.reviewed} / {gameContext.moves.length}</strong></div>
                      <div><span>Average CPL</span><strong>{reviewSummary.averageCentipawnLoss}</strong></div>
                      <div><span>Errors</span><strong>{reviewSummary.inaccuracies + reviewSummary.mistakes + reviewSummary.blunders}</strong></div>
                    </div>
                    <div className="game-review-side-performance" aria-label="Per-side reviewed move summary" aria-live="polite">
                      <div className="game-review-side-performance__heading">
                        <span className="analysis-label">Side performance</span>
                        <small>Engine-reviewed moves only</small>
                      </div>
                      <div className="game-review-side-performance__grid">
                        {([
                          { side: "White", label: whiteSideLabel, summary: sideReviewSummary.white },
                          { side: "Black", label: blackSideLabel, summary: sideReviewSummary.black },
                        ] as const).map(({ side, label, summary }) => (
                          <div className="game-review-side-performance__card" key={side}>
                            <div className="game-review-side-performance__card-head">
                              <strong>{label}</strong>
                              <span>{side}</span>
                            </div>
                            <dl>
                              <div><dt>Reviewed</dt><dd>{summary.reviewed}</dd></div>
                              <div><dt>Average CPL</dt><dd>{summary.reviewed ? `${summary.averageCentipawnLoss} cp` : "—"}</dd></div>
                              <div><dt>Errors</dt><dd>{summary.inaccuracies + summary.mistakes + summary.blunders}</dd></div>
                            </dl>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {criticalReviewMoments.length > 0 && (
                  <div className="game-review-critical-moments" aria-label="Critical review moments">
                    <span className="analysis-label">Critical moments</span>
                    <div className="game-review-move-timeline" role="list" aria-label="Highest centipawn-loss reviewed moves">
                      {criticalReviewMoments.map((moment) => {
                        const move = gameContext.moves[moment.ply - 1] ?? `Ply ${moment.ply}`;
                        return (
                          <button
                            key={moment.ply}
                            type="button"
                            role="listitem"
                            onClick={() => selectReplayPosition(moment.ply)}
                            disabled={reviewBusy}
                            aria-current={replayIndex === moment.ply ? "step" : undefined}
                            aria-label={`Jump to critical move ${moment.ply}, ${move}: ${moment.classification.label}, ${moment.classification.centipawnLoss} centipawn loss`}
                            className={replayIndex === moment.ply ? "is-current is-reviewed" : "is-reviewed"}
                          >
                            <span>{moment.ply}</span>
                            <strong>{move}</strong>
                            <em className="game-review-timeline-verdict">{moment.classification.label} · {moment.classification.centipawnLoss} CPL</em>
                          </button>
                        );
                      })}
                    </div>
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
                      <button type="button" onClick={() => selectReplayPosition(replayIndex - 1)} disabled={replayIndex === 0 || reviewBusy} aria-label="Previous position"><ChevronLeft size={16} /> Previous</button>
                      <button type="button" onClick={() => selectReplayPosition(replayIndex + 1)} disabled={replayIndex >= replayPositions.length - 1 || reviewBusy} aria-label="Next position">Next <ChevronRight size={16} /></button>
                    </div>
                    <button type="button" className="game-review-final-action" onClick={() => selectReplayPosition(replayPositions.length - 1)} disabled={replayIndex === replayPositions.length - 1 || reviewBusy} aria-label="Back to final position"><SkipForward size={15} /> Back to final position</button>

                    <div className="game-review-engine-check" aria-live="polite">
                      <div>
                        <span className="analysis-label">Selected move</span>
                        <strong>{selectedMoveContext ? `${selectedMoveContext.ply}. ${selectedMoveContext.playedMove}` : "Choose a recorded move"}</strong>
                      </div>
                      <button type="button" className="game-review-engine-action" onClick={reviewSelectedMove} disabled={!selectedMoveContext || reviewBusy}>
                        <Sparkles size={15} /> {reviewLoading ? "Reviewing…" : visibleMoveReview ? "Re-review selected move" : "Review selected move"}
                      </button>
                      <button type="button" className="game-review-engine-action" onClick={reviewRemainingMoves} disabled={reviewBusy || remainingReviewPlies.length === 0} aria-label="Review remaining saved-game moves">
                        <Sparkles size={15} /> {reviewAllProgress ? `Reviewing ${reviewAllProgress.completed}/${reviewAllProgress.total}` : remainingReviewPlies.length === 0 ? "All moves reviewed" : `Review remaining moves (${remainingReviewPlies.length})`}
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
              <button className="primary-action analysis-primary-action" type="button" onClick={runAnalysis} disabled={loading || reviewBusy}>
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