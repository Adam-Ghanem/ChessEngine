/**
 * ChessIQ Intelligence in Motion: explicit connection from selected move through evaluation to chess understanding.
 */
import type { AnalysisMove } from "@/types/analysis";

interface AnalysisThreadProps { move: AnalysisMove; }

function evaluationLabel(score: number) { return `${score > 0 ? "+" : ""}${score.toFixed(2)}`; }

export function AnalysisThread({ move }: AnalysisThreadProps) {
  return (
    <section className="analysis-thread" aria-labelledby="analysis-thread-title">
      <div className="thread-heading"><span>Analysis thread</span><i /></div>
      <ol id="analysis-thread-title">
        <li><span className="thread-node">01</span><div><small>Move</small><strong>{move.fullMove}{move.side === "black" ? "…" : "."} {move.san}</strong></div></li>
        <li><span className="thread-node">02</span><div><small>Evaluation</small><strong>{evaluationLabel(move.evaluation.score)}</strong></div></li>
        <li><span className="thread-node">03</span><div><small>Tactical event</small><strong>{move.tacticalEvent || "Position shift"}</strong></div></li>
        <li><span className="thread-node">04</span><div><small>Understanding</small><strong>{move.explanation}</strong></div></li>
      </ol>
    </section>
  );
}
