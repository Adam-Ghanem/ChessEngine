export type MoveReviewLabel = "Best move" | "Excellent" | "Good" | "Inaccuracy" | "Mistake" | "Blunder";

export type MoveReviewClassification = {
  label: MoveReviewLabel;
  centipawnLoss: number;
};

type MoveReviewInput = {
  bestMoveMatch: boolean;
  beforeScoreCp: number;
  afterScoreCp: number;
};

/**
 * Engine scores are reported from the side-to-move perspective. After the
 * recorded move the opponent is to move, so the mover's resulting score is
 * the negated after-score. CPL is therefore before + after.
 *
 * Thresholds are intentionally simple and deterministic for this first-party
 * ChessEngine review: <=20 Excellent, <=50 Good, <=100 Inaccuracy,
 * <=200 Mistake, >200 Blunder. Exact engine matches are always Best move.
 */
export function classifyMoveReview({ bestMoveMatch, beforeScoreCp, afterScoreCp }: MoveReviewInput): MoveReviewClassification {
  if (bestMoveMatch) return { label: "Best move", centipawnLoss: 0 };

  const centipawnLoss = Math.max(0, Math.round(beforeScoreCp + afterScoreCp));
  if (centipawnLoss <= 20) return { label: "Excellent", centipawnLoss };
  if (centipawnLoss <= 50) return { label: "Good", centipawnLoss };
  if (centipawnLoss <= 100) return { label: "Inaccuracy", centipawnLoss };
  if (centipawnLoss <= 200) return { label: "Mistake", centipawnLoss };
  return { label: "Blunder", centipawnLoss };
}
