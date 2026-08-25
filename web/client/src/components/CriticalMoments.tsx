/**
 * ChessIQ Intelligence in Motion: moments bind an evaluation event to a review action or deliberate retry.
 */
import { RotateCcw, Target } from "lucide-react";
import { ClassificationBadge } from "@/components/ClassificationBadge";
import type { AnalysisMove, CriticalMoment } from "@/types/analysis";

interface CriticalMomentsProps { moves: AnalysisMove[]; moments: CriticalMoment[]; activeIndex: number; onSelect: (index: number) => void; onTryAgain: (index: number) => void; }
function scoreLabel(value: number) { return `${value > 0 ? "+" : ""}${value.toFixed(2)}`; }

export function CriticalMoments({ moves, moments, activeIndex, onSelect, onTryAgain }: CriticalMomentsProps) {
  return (
    <section className="critical-moments-panel" aria-labelledby="critical-moments-heading"><div className="panel-heading-row"><div><p className="eyebrow">Review queue</p><h2 id="critical-moments-heading">Critical moments</h2></div><Target size={17} aria-hidden="true" /></div><div className="critical-moment-list">{moments.map((moment) => { const move = moves[moment.moveIndex]; const practice = moment.practiceIndex !== undefined; return <article key={moment.id} className={`critical-moment ${activeIndex === moment.moveIndex ? "is-active" : ""}`}><div className="critical-moment-meta"><span>MOVE {move.fullMove}{move.side === "black" ? "…" : ""}</span><ClassificationBadge classification={move.classification} compact /></div><strong>{move.san}</strong><p className="moment-evaluation">{scoreLabel(moment.evaluationBefore)} <i>→</i> {scoreLabel(moment.evaluationAfter)}</p><p>{moment.whyItMatters}</p><div className="moment-actions"><button onClick={() => onSelect(moment.moveIndex)}>Review</button>{practice && <button className="try-again-button" onClick={() => onTryAgain(moment.practiceIndex!)}><RotateCcw size={12} />Try again</button>}</div></article>; })}</div></section>
  );
}
