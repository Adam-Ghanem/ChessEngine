export type MoveReviewLabel = "Best move" | "Excellent" | "Good" | "Inaccuracy" | "Mistake" | "Blunder";

export type MoveReviewClassification = {
  label: MoveReviewLabel;
  centipawnLoss: number;
};

export type MoveReviewSummary = {
  reviewed: number;
  best: number;
  excellent: number;
  good: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  averageCentipawnLoss: number;
};

export type MoveReviewSideSummary = {
  white: MoveReviewSummary;
  black: MoveReviewSummary;
};

export type CriticalReviewMoment = {
  ply: number;
  classification: MoveReviewClassification;
};

type MoveReviewInput = {
  bestMoveMatch: boolean;
  beforeScoreCp: number;
  afterScoreCp: number;
};

/**
 * Return the one-based plies that still need an engine review. Keeping this
 * deterministic lets the UI resume a partially reviewed game without
 * re-running already cached first-party ChessEngine work.
 */
export function pendingReviewPlies(totalMoves: number, reviewedPlies: readonly number[]): number[] {
  const safeTotal = Math.max(0, Math.floor(totalMoves));
  const reviewed = new Set<number>();
  reviewedPlies.forEach((ply) => {
    if (Number.isInteger(ply) && ply >= 1 && ply <= safeTotal) reviewed.add(ply);
  });

  const pending: number[] = [];
  for (let ply = 1; ply <= safeTotal; ply += 1) {
    if (!reviewed.has(ply)) pending.push(ply);
  }
  return pending;
}

/**
 * Rank only review errors by centipawn loss so the UI can surface the most
 * useful positions without inventing conclusions for unreviewed or good moves.
 */
export function rankCriticalReviewMoments(
  reviews: readonly { ply: number; classification: MoveReviewClassification | null | undefined }[],
  limit = 3,
): CriticalReviewMoment[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0) return [];

  return reviews
    .filter((review): review is CriticalReviewMoment => {
      const label = review.classification?.label;
      return label === "Inaccuracy" || label === "Mistake" || label === "Blunder";
    })
    .sort((left, right) =>
      right.classification.centipawnLoss - left.classification.centipawnLoss || left.ply - right.ply,
    )
    .slice(0, safeLimit);
}

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

export function summarizeMoveReviews(classifications: Array<MoveReviewClassification | null | undefined>): MoveReviewSummary {
  const summary: MoveReviewSummary = {
    reviewed: 0,
    best: 0,
    excellent: 0,
    good: 0,
    inaccuracies: 0,
    mistakes: 0,
    blunders: 0,
    averageCentipawnLoss: 0,
  };

  let totalCentipawnLoss = 0;
  for (const classification of classifications) {
    if (!classification) continue;
    summary.reviewed += 1;
    totalCentipawnLoss += classification.centipawnLoss;
    if (classification.label === "Best move") summary.best += 1;
    if (classification.label === "Excellent") summary.excellent += 1;
    if (classification.label === "Good") summary.good += 1;
    if (classification.label === "Inaccuracy") summary.inaccuracies += 1;
    if (classification.label === "Mistake") summary.mistakes += 1;
    if (classification.label === "Blunder") summary.blunders += 1;
  }

  summary.averageCentipawnLoss = summary.reviewed ? Math.round(totalCentipawnLoss / summary.reviewed) : 0;
  return summary;
}

export function summarizeMoveReviewsBySide(
  reviews: readonly { ply: number; classification: MoveReviewClassification | null | undefined }[],
): MoveReviewSideSummary {
  const white: Array<MoveReviewClassification | null | undefined> = [];
  const black: Array<MoveReviewClassification | null | undefined> = [];

  for (const review of reviews) {
    if (!Number.isInteger(review.ply) || review.ply < 1) continue;
    (review.ply % 2 === 1 ? white : black).push(review.classification);
  }

  return {
    white: summarizeMoveReviews(white),
    black: summarizeMoveReviews(black),
  };
}
