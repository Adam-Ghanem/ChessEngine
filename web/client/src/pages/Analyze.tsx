import { useMemo, useState } from "react";
import { BarChart3, Gauge, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ChessBoard } from "@/components/ChessBoard";
import { ProductHeader } from "@/components/ProductHeader";
import { analyzePosition, type ServerEngineAnalysis } from "@/engine/serverEngine";
import { validateFenShape } from "@/engine/fen";
import { initialAnalysisFenFromSearch } from "@/lib/analysisRoute";
import "@/fen-analyze.css";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function Analyze() {
  const initialFen = useMemo(
    () => initialAnalysisFenFromSearch(typeof window === "undefined" ? "" : window.location.search, START_FEN),
    [],
  );
  const [draftFen, setDraftFen] = useState(initialFen);
  const [loadedFen, setLoadedFen] = useState(initialFen);
  const [depth, setDepth] = useState(6);
  const [analysis, setAnalysis] = useState<ServerEngineAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bestArrow = useMemo(() => {
    if (!analysis || !/^[a-h][1-8][a-h][1-8]/.test(analysis.bestMove)) return { from: "a1", to: "a1" };
    return { from: analysis.bestMove.slice(0, 2), to: analysis.bestMove.slice(2, 4) };
  }, [analysis]);

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
            <h1>Analyze any position.</h1>
            <p>Load a FEN and run the first-party ChessEngine directly against that position. No sample score replaces the live result.</p>
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
              <Link href="/play" className="fen-review-link">Open Play</Link>
            </div>
            <div className="analysis-board-stage">
              <div className="analysis-board-wrap fen-board-wrap">
                <ChessBoard fen={loadedFen} lastMove={{ from: "a1", to: "a1" }} engineArrow={bestArrow} />
              </div>
            </div>
          </div>

          <aside className="fen-analyze-rail">
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
                <input type="range" min="1" max="10" value={depth} onChange={(event) => setDepth(Number(event.target.value))} />
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
