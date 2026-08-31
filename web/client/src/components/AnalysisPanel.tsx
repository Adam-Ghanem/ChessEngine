/**
 * ChessIQ Intelligence in Motion: engine data scales between clear beginner insight and advanced technical detail.
 */
import { ChevronDown, Cpu, Gauge, Network, ScanLine } from "lucide-react";
import { IQPulse } from "@/components/IQPulse";
import type { ServerEngineAnalysis } from "@/engine/serverEngine";
import type { AnalysisMode, AnalysisMove, EngineLine } from "@/types/analysis";

interface AnalysisPanelProps {
  move: AnalysisMove;
  mode: AnalysisMode;
  isAnalyzing: boolean;
  liveAnalysis?: ServerEngineAnalysis | null;
}

function scoreLabel(score: number) {
  if (Math.abs(score) >= 100) return score > 0 ? "Mating" : "Mate threat";
  return `${score > 0 ? "+" : ""}${score.toFixed(2)}`;
}

export function AnalysisPanel({ move, mode, isAnalyzing, liveAnalysis = null }: AnalysisPanelProps) {
  const liveScore = liveAnalysis ? liveAnalysis.scoreCp / 100 : null;
  const score = liveScore ?? move.evaluation.score;
  const bestMove = liveAnalysis?.bestMove ?? move.bestMove;
  const principalVariation = liveAnalysis?.principalVariation || move.pv;
  const depth = liveAnalysis?.depth ?? move.depth;
  const lines: EngineLine[] = [
    { rank: 1, bestMove, pv: principalVariation, depth, nodes: liveAnalysis ? "Live" : move.nodes },
    { rank: 2, bestMove: "7. c3", pv: "7. c3 Be7 8. d4", depth: Math.max(1, (depth || 0) - 1), nodes: "5.1M" },
  ];
  const advanced = mode === "advanced";

  return (
    <section className={`analysis-panel ${isAnalyzing ? "is-analyzing" : ""}`} aria-labelledby="analysis-heading">
      <div className="analysis-panel-topline">
        <div className="analysis-status">
          <IQPulse compact active={isAnalyzing} label={isAnalyzing ? "Engine analyzing" : liveAnalysis ? "Live engine result" : "Engine ready"} />
          <span>{isAnalyzing ? "Calculating" : liveAnalysis ? "Live result" : "Engine ready"}</span>
        </div>
        <span className="mode-chip">{advanced ? "Advanced" : "Beginner"}</span>
      </div>

      <div className="analysis-score-row">
        <div>
          <p className="eyebrow">Engine evaluation</p>
          <h2 id="analysis-heading" className="evaluation-number">{scoreLabel(score)}</h2>
        </div>
        <div className="score-side-note">
          <span>Position</span>
          <strong>{score >= 0 ? "White edge" : "Black edge"}</strong>
        </div>
      </div>

      {advanced && (
        <div className="engine-readout-grid">
          <div><Gauge aria-hidden="true" /><span>Depth</span><strong>{isAnalyzing ? "…" : depth}</strong></div>
          <div><Network aria-hidden="true" /><span>Source</span><strong>{liveAnalysis ? "Live" : move.nodes}</strong></div>
          <div><ScanLine aria-hidden="true" /><span>MultiPV</span><strong>1</strong></div>
        </div>
      )}

      <div className="best-line-section">
        <div className="best-line-heading"><Cpu aria-hidden="true" /><span>{advanced ? "Principal variation" : "Best move"}</span></div>
        {lines.slice(0, advanced ? (liveAnalysis ? 1 : 2) : 1).map((line) => (
          <div className="engine-line" key={line.rank}>
            <span>{advanced ? `${line.rank}.` : ""}</span>
            <strong>{line.bestMove}</strong>
            <p>{advanced ? line.pv : liveAnalysis ? `First-party ChessEngine recommends ${line.bestMove}.` : move.explanation}</p>
            {advanced && !liveAnalysis && <ChevronDown aria-hidden="true" />}
          </div>
        ))}
      </div>

      <p className="analysis-disclaimer">
        {liveAnalysis ? `Live analysis from ${liveAnalysis.engine}.` : "Sample review data. Press Analyze position to run the first-party ChessEngine on this exact FEN."}
      </p>
    </section>
  );
}
