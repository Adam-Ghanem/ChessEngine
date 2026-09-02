import { useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Gauge, History, SkipForward, Sparkles, Swords } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChessBoard } from "@/components/ChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { analyzePosition, type ServerEngineAnalysis } from "@/engine/serverEngine";
import { validateFenShape } from "@/engine/fen";
import { initialAnalysisFenFromSearch, initialAnalysisGameIdFromSearch } from "@/lib/analysisRoute";
import { readGameHistory, type StoredGame } from "@/lib/gameHistory";
import "@/fen-analyze.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function gameStatusLabel(game: StoredGame) {
  if (game.status === "checkmate") return "Checkmate";
  if (game.status === "stalemate") return "Stalemate";
  if (game.status === "draw") return "Draw";
  if (game.status === "check") return "In check";
  return "In progress";
}

function moveArrow(move: string | undefined) {
  if (!move || !/^[a-h][1-8][a-h][1-8]/.test(move)) return { from: "a1", to: "a1" };
  return { from: move.slice(0, 2), to: move.slice(2, 4) };
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

  return (
    <main className="app-shell chessiq-shell">
      <div className="analysis-product-shell fen-analyze-shell">
        <ProductHeader activePath="/analyze" />

        <section className="analysis-hero fen-analyze-hero">
          <div className="analysis-hero-copy">
            <div className="analysis-hero-kicker"><Sparkles size={14} /> Live ChessEngine</div>
            <h1>{gameContext ? "Review your saved game position." : "Analyze any position."}</h1>
            <p>{gameContext ? "ChessIQ keeps the saved-game context with this position, so you can replay recorded positions and run the live first-party engine at the moment that matters." : "Load a FEN and run the first-party ChessEngine directly against that position. No sample score replaces the live result."}</p>
          </div>
          <div className="analysis-hero-meta" aria-label="Analyze status">
            <div><span>Depth</span><strong>{depth}</strong></div>
            <div><span>Engine</span><strong>{analysis?.engine ?? "ChessEngine"}</strong></div>
            <div className={loading ? "engine-status is-live" : "engine-status"}><span>Status</span><strong>{loading ? "Calculating" : analysis ? "Complete" : "Ready"}</strong></div>
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
                  <div><span>Status</span><strong>{gameStatusLabel(gameContext)}</strong></div>
                  <div><span>Moves</span><strong>{gameContext.moves.length} ply</strong></div>
                </div>
                <div className="game-review-moves">
                  <span><Swords size={14} /> Recent moves</span>
                  <p>{gameContext.moves.length ? gameContext.moves.slice(-8).join(" · ") : "No recorded moves"}</p>
                </div>
                {replayPositions ? (
                  <div className="game-review-replay" aria-label="Saved game replay">
                    <div className="game-review-replay-status" aria-live="polite">
                      <span>Replay position</span>
                      <strong>{replayIndex} / {Math.max(0, replayPositions.length - 1)}</strong>
                    </div>
                    {gameContext.moves.length > 0 && (
                      <div className="game-review-move-timeline" role="list" aria-label="Recorded move timeline">
                        {gameContext.moves.map((move, index) => (
                          <button
                            key={`${index}-${move}`}
                            type="button"
                            role="listitem"
                            onClick={() => selectReplayPosition(index + 1)}
                            aria-label={`Jump to position ${index + 1} after ${move}`}
                            aria-current={replayIndex === index + 1 ? "step" : undefined}
                            className={replayIndex === index + 1 ? "is-current" : ""}
                          >
                            <span>{index + 1}</span>
                            <strong>{move}</strong>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="game-review-replay-actions">
                      <button type="button" onClick={() => selectReplayPosition(replayIndex - 1)} disabled={replayIndex === 0} aria-label="Previous position"><ChevronLeft size={16} /> Previous</button>
                      <button type="button" onClick={() => selectReplayPosition(replayIndex + 1)} disabled={replayIndex >= replayPositions.length - 1} aria-label="Next position">Next <ChevronRight size={16} /></button>
                    </div>
                    <button type="button" className="game-review-final-action" onClick={() => selectReplayPosition(replayPositions.length - 1)} disabled={replayIndex === replayPositions.length - 1} aria-label="Back to final position"><SkipForward size={15} /> Back to final position</button>
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
