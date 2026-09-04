import { describe, expect, it } from "vitest";
import { summarizeMoveReviewsBySide, type MoveReviewClassification } from "./gameReview";

const review = (ply: number, label: MoveReviewClassification["label"], centipawnLoss: number) => ({
  ply,
  classification: { label, centipawnLoss } satisfies MoveReviewClassification,
});

describe("summarizeMoveReviewsBySide", () => {
  it("separates reviewed white and black plies without inventing missing classifications", () => {
    expect(summarizeMoveReviewsBySide([
      review(1, "Best move", 0),
      review(2, "Mistake", 140),
      review(3, "Inaccuracy", 80),
      { ply: 4, classification: null },
      review(5, "Good", 30),
      review(6, "Blunder", 260),
    ])).toEqual({
      white: {
        reviewed: 3,
        best: 1,
        excellent: 0,
        good: 1,
        inaccuracies: 1,
        mistakes: 0,
        blunders: 0,
        averageCentipawnLoss: 37,
      },
      black: {
        reviewed: 2,
        best: 0,
        excellent: 0,
        good: 0,
        inaccuracies: 0,
        mistakes: 1,
        blunders: 1,
        averageCentipawnLoss: 200,
      },
    });
  });

  it("ignores invalid plies and returns zeroed summaries when nothing is classified", () => {
    expect(summarizeMoveReviewsBySide([
      { ply: 0, classification: { label: "Blunder", centipawnLoss: 999 } },
      { ply: -1, classification: { label: "Mistake", centipawnLoss: 150 } },
      { ply: 1, classification: null },
    ])).toEqual({
      white: {
        reviewed: 0,
        best: 0,
        excellent: 0,
        good: 0,
        inaccuracies: 0,
        mistakes: 0,
        blunders: 0,
        averageCentipawnLoss: 0,
      },
      black: {
        reviewed: 0,
        best: 0,
        excellent: 0,
        good: 0,
        inaccuracies: 0,
        mistakes: 0,
        blunders: 0,
        averageCentipawnLoss: 0,
      },
    });
  });
});
