/**
 * ChessIQ Intelligence in Motion: a hoverable instrument graph synchronized to the shared selected ply.
 */
import { useState } from "react";
import { classificationMeta, type AnalysisMove } from "@/types/analysis";

interface EvaluationGraphProps { moves: AnalysisMove[]; activeIndex: number; onSelect: (index: number) => void; }
function graphY(value: number) { return 50 - Math.max(-3.2, Math.min(3.2, value)) * 12; }
function scoreLabel(value: number) { return `${value > 0 ? "+" : ""}${value.toFixed(2)}`; }

export function EvaluationGraph({ moves, activeIndex, onSelect }: EvaluationGraphProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const points = moves.map((move, index) => ({ x: 5 + index / (moves.length - 1) * 90, y: graphY(move.evaluation.score) }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const focusIndex = hoverIndex ?? activeIndex;
  const focusMove = moves[focusIndex];
  const focusPoint = points[focusIndex];

  return (
    <section className="evaluation-graph-panel" aria-labelledby="evaluation-graph-heading">
      <div className="panel-heading-row"><div><p className="eyebrow">IQ Pulse</p><h2 id="evaluation-graph-heading">Evaluation trace</h2></div><span className="graph-key"><i /> White advantage</span></div>
      <div className="evaluation-graph" role="group" aria-label="Evaluation graph. Hover or focus a move to inspect it, then click to jump to its board position.">
        <div className="graph-axis graph-axis-top">+3</div><div className="graph-axis graph-axis-middle">0</div><div className="graph-axis graph-axis-bottom">−3</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="100" y1="50" y2="50" className="graph-zero-line" /><path d={path} className="graph-line" /><path d={`${path} L 95 100 L 5 100 Z`} className="graph-fill" />{points.map((point, index) => <circle key={moves[index].id} cx={point.x} cy={point.y} r={index === focusIndex ? 2.55 : 1.05} className={`graph-point ${index === activeIndex ? "is-active" : ""} marker-${classificationMeta[moves[index].classification].tone}`} />)}</svg>
        <div className="graph-hit-layer">{points.map((point, index) => <button key={moves[index].id} className="graph-point-hit" style={{ left: `${point.x}%`, top: `${point.y}%` }} onMouseEnter={() => setHoverIndex(index)} onMouseLeave={() => setHoverIndex(null)} onFocus={() => setHoverIndex(index)} onBlur={() => setHoverIndex(null)} onClick={() => onSelect(index)} aria-label={`Move ${moves[index].fullMove}${moves[index].side === "black" ? " black" : " white"}: ${moves[index].san}. Evaluation ${scoreLabel(moves[index].evaluation.score)}.`} />)}</div>
        <div className="graph-tooltip" style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%` }}><strong>{focusMove.san}</strong><span>{scoreLabel(focusMove.evaluation.score)}</span></div>
      </div>
      <div className="graph-footer"><span>1</span><span>3</span><span>5</span><span>7</span></div>
    </section>
  );
}
