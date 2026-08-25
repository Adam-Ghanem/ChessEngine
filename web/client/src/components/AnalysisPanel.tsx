/**
 * ChessIQ Intelligence in Motion: engine data scales between clear beginner insight and advanced technical detail.
 */
import { ChevronDown, Cpu, Gauge, Network, ScanLine } from "lucide-react";
import { IQPulse } from "@/components/IQPulse";
import type { AnalysisMode, AnalysisMove, EngineLine } from "@/types/analysis";

interface AnalysisPanelProps { move: AnalysisMove; mode: AnalysisMode; isAnalyzing: boolean; }
function scoreLabel(score: number) { return `${score > 0 ? "+" : ""}${score.toFixed(2)}`; }

export function AnalysisPanel({ move, mode, isAnalyzing }: AnalysisPanelProps) {
  const lines: EngineLine[] = [{ rank: 1, bestMove: move.bestMove, pv: move.pv, depth: move.depth, nodes: move.nodes }, { rank: 2, bestMove: "7. c3", pv: "7. c3 Be7 8. d4", depth: Math.max(1, (move.depth || 0) - 1), nodes: "5.1M" }];
  const advanced = mode === "advanced";

  return (
    <section className={`analysis-panel ${isAnalyzing ? "is-analyzing" : ""}`} aria-labelledby="analysis-heading">
      <div className="analysis-panel-topline"><div className="analysis-status"><IQPulse compact active={isAnalyzing} label={isAnalyzing ? "Engine analyzing" : "Engine ready"} /><span>{isAnalyzing ? "Calculating" : "Engine ready"}</span></div><span className="mode-chip">{advanced ? "Advanced" : "Beginner"}</span></div>
      <div className="analysis-score-row"><div><p className="eyebrow">Engine evaluation</p><h2 id="analysis-heading" className="evaluation-number">{scoreLabel(move.evaluation.score)}</h2></div><div className="score-side-note"><span>Position</span><strong>{move.evaluation.score >= 0 ? "White edge" : "Black edge"}</strong></div></div>
      {advanced && <div className="engine-readout-grid"><div><Gauge aria-hidden="true" /><span>Depth</span><strong>{isAnalyzing ? Math.max(9, (move.depth || 16) - 5) : move.depth}</strong></div><div><Network aria-hidden="true" /><span>Nodes</span><strong>{isAnalyzing ? "842K" : move.nodes}</strong></div><div><ScanLine aria-hidden="true" /><span>MultiPV</span><strong>2</strong></div></div>}
      <div className="best-line-section"><div className="best-line-heading"><Cpu aria-hidden="true" /><span>{advanced ? "Principal variation" : "Best move"}</span></div>{lines.slice(0, advanced ? 2 : 1).map((line) => <div className="engine-line" key={line.rank}><span>{advanced ? `${line.rank}.` : ""}</span><strong>{line.bestMove}</strong><p>{advanced ? line.pv : move.explanation}</p>{advanced && <ChevronDown aria-hidden="true" />}</div>)}</div>
      <p className="analysis-disclaimer">Local sample view. Live FEN analysis will replace this source through the ChessEngine WASM bridge.</p>
    </section>
  );
}
