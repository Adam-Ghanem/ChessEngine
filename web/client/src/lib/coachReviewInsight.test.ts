import { describe, expect, it } from "vitest";
import type { StoredGame } from "./gameHistory";
import type { GameReviewCache } from "./gameReviewCache";
import { biggestReviewedWeakness } from "./coachReviewInsight";

const game: StoredGame = {
  id: "game-1",
  mode: "computer",
  status: "checkmate",
  fen: "final-fen",
  moves: ["e2e4", "e7e5", "g1f3"],
  positions: ["start-fen", "after-1", "after-2", "final-fen"],
  playerSide: "white",
  result: "white-win",
  termination: "checkmate",
  updatedAt: "2026-09-05T07:00:00.000Z",
};

function review(ply: number, label: "Best move" | "Good" | "Inaccuracy" | "Mistake" | "Blunder", centipawnLoss: number) {
  return {
    ply,
    playedMove: game.moves[ply - 1],
    analysis: { bestMove: "a2a3", scoreCp: 20, depth: 6, principalVariation: "a2a3", engine: "ChessEngine" },
    afterAnalysis: null,
    classification: { label, centipawnLoss },
  };
}

describe("Coach reviewed weakness", () => {
  it("returns the highest-loss reviewed error with the position before that move", () => {
    const reviews: GameReviewCache = {
      1: review(1, "Good", 35),
      2: review(2, "Mistake", 145),
      3: review(3, "Blunder", 260),
    };

    expect(biggestReviewedWeakness(game, reviews)).toEqual({
      ply: 3,
      playedMove: "g1f3",
      positionBeforeFen: "after-2",
      label: "Blunder",
      centipawnLoss: 260,
    });
  });

  it("returns null when reviewed moves contain no inaccuracy-or-worse decision", () => {
    const reviews: GameReviewCache = {
      1: review(1, "Best move", 0),
      2: review(2, "Good", 28),
    };

    expect(biggestReviewedWeakness(game, reviews)).toBeNull();
  });

  it("ignores a reviewed ply when replay history cannot prove its pre-move position", () => {
    const legacyGame = { ...game, positions: undefined };
    const reviews: GameReviewCache = { 3: review(3, "Blunder", 260) };

    expect(biggestReviewedWeakness(legacyGame, reviews)).toBeNull();
  });
});
