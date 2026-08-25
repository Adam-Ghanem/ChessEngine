/**
 * ChessIQ Intelligence in Motion: classified-move review card for turning engine output into immediate coaching feedback.
 */
import { Check, ChevronRight, Share2, Sparkles, Trophy, X, Zap } from "lucide-react";
import { classificationMeta, type AnalysisMove, type MoveClassification } from "@/types/analysis";
import "@/game-review.css";

interface GameReviewCardProps { move: AnalysisMove; onClose: () => void; onNext: () => void; onShare: () => void; }

const reviewIcons: Partial<Record<MoveClassification, typeof Sparkles>> = { BRILLIANT: Sparkles, GREAT: Trophy, BEST: Zap, EXCELLENT: Check };

function evaluationLabel(value: number) { return `${value > 0 ? "+" : ""}${value.toFixed(2)}`; }

export function GameReviewCard({ move, onClose, onNext, onShare }: GameReviewCardProps) {
  const meta = classificationMeta[move.classification];
  const Icon = reviewIcons[move.classification] ?? Sparkles;
  const moveLabel = `${move.fullMove}${move.side === "black" ? "…" : "."} ${move.san}`;
  const title = `${moveLabel} is ${meta.label.toLowerCase()}`;

  return <section className={`game-review-card review-tone-${meta.tone}`} aria-live="polite" aria-label={`Game Review: ${title}`}>
    <div className="review-accent" aria-hidden="true"><Icon size={20} /></div>
    <div className="review-card-content"><div className="review-card-topline"><p className="review-kicker">Game review</p><button className="review-close" onClick={onClose} aria-label="Dismiss review card"><X size={16} /></button></div><div className="review-title-row"><h2>{title}</h2><strong className="review-evaluation">{evaluationLabel(move.evaluation.score)}</strong></div><p className="review-explanation">{move.explanation}</p><div className="review-action-row"><button className="review-share" onClick={onShare}><Share2 size={16} />Share insight</button><button className="review-next" onClick={onNext}>Next<ChevronRight size={17} /></button></div></div>
  </section>;
}
