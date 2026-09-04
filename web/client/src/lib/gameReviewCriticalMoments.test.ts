import { describe, expect, it } from "vitest";
import { rankCriticalReviewMoments, type MoveReviewClassification } from "./gameReview";

describe("rankCriticalReviewMoments", () => {
  it("returns the highest-loss reviewed plies in descending CPL order", () => {
    const reviewed: Array<{ ply: number; classification: MoveReviewClassification | null }> = [
      { ply: 1, classification: { label: "Good", centipawnLoss: 31 } },
      { ply: 2, classification: { label: "Blunder", centipawnLoss: 245 } },
      { ply: 3, classification: null },
      { ply: 4, classification: { label: "Mistake", centipawnLoss: 142 } },
      { ply: 5, classification: { label: "Inaccuracy", centipawnLoss: 73 } },
      { ply: 6, classification: { label: "Excellent", centipawnLoss: 10 } },
    ];

    expect(rankCriticalReviewMoments(reviewed, 3)).toEqual([
      { ply: 2, classification: { label: "Blunder", centipawnLoss: 245 } },
      { ply: 4, classification: { label: "Mistake", centipawnLoss: 142 } },
      { ply: 5, classification: { label: "Inaccuracy", centipawnLoss: 73 } },
    ]);
  });

  it("ignores non-errors and handles invalid limits safely", () => {
    const reviewed = [
      { ply: 1, classification: { label: "Best move", centipawnLoss: 0 } as MoveReviewClassification },
      { ply: 2, classification: { label: "Excellent", centipawnLoss: 18 } as MoveReviewClassification },
      { ply: 3, classification: { label: "Mistake", centipawnLoss: 150 } as MoveReviewClassification },
    ];

    expect(rankCriticalReviewMoments(reviewed, 0)).toEqual([]);
    expect(rankCriticalReviewMoments(reviewed, 3)).toEqual([
      { ply: 3, classification: { label: "Mistake", centipawnLoss: 150 } },
    ]);
  });
});
