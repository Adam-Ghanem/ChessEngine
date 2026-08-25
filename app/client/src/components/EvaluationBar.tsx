/**
 * ChessIQ Intelligence in Motion: the evaluation spine is the attached physical reading of the board position.
 */
import type { Evaluation } from "@/types/analysis";

interface EvaluationBarProps { evaluation: Evaluation; }

function displayEvaluation(evaluation: Evaluation) {
  if (evaluation.mateIn) return `M${Math.abs(evaluation.mateIn)}`;
  return `${evaluation.score > 0 ? "+" : ""}${evaluation.score.toFixed(2)}`;
}

export function EvaluationBar({ evaluation }: EvaluationBarProps) {
  const whitePercent = Math.max(4, Math.min(96, 50 + evaluation.score * 12));
  const side = evaluation.score >= 0 ? "White" : "Black";

  return (
    <div className="evaluation-spine" aria-label={`Evaluation ${displayEvaluation(evaluation)}, ${side} advantage`}>
      <span className="evaluation-spine-value">{displayEvaluation(evaluation)}</span>
      <div className="evaluation-bar-track" aria-hidden="true"><div className="evaluation-bar-white" style={{ height: `${whitePercent}%` }} /></div>
      <span className="evaluation-side-label evaluation-white-label">W</span><span className="evaluation-side-label evaluation-black-label">B</span>
    </div>
  );
}
