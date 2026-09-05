import { describe, expect, it } from "vitest";
import {
  readPlayerGameReviewSummary,
  writeGameReviewCache,
  type GameReviewCache,
} from "@/lib/gameReviewCache";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}

const moves = ["e2e4", "e7e5", "g1f3", "b8c6"];
const analysis = {
  bestMove: "e2e4",
  scoreCp: 20,
  depth: 8,
  principalVariation: "e2e4 e7e5",
  engine: "ChessEngine",
};

const reviews: GameReviewCache = {
  1: {
    ply: 1,
    playedMove: moves[0],
    analysis,
    afterAnalysis: analysis,
    classification: { label: "Best move", centipawnLoss: 0 },
  },
  2: {
    ply: 2,
    playedMove: moves[1],
    analysis,
    afterAnalysis: analysis,
    classification: { label: "Blunder", centipawnLoss: 400 },
  },
  3: {
    ply: 3,
    playedMove: moves[2],
    analysis,
    afterAnalysis: analysis,
    classification: { label: "Mistake", centipawnLoss: 140 },
  },
  4: {
    ply: 4,
    playedMove: moves[3],
    analysis,
    afterAnalysis: analysis,
    classification: { label: "Good", centipawnLoss: 20 },
  },
};

describe("persisted player Game Review quality", () => {
  it("summarizes only the reviewed moves played by the selected side", () => {
    const storage = memoryStorage();
    writeGameReviewCache(storage, "quality-game", 8, moves, reviews);

    expect(readPlayerGameReviewSummary(storage, "quality-game", moves, "white")).toEqual({
      reviewed: 2,
      best: 1,
      excellent: 0,
      good: 0,
      inaccuracies: 0,
      mistakes: 1,
      blunders: 0,
      averageCentipawnLoss: 70,
    });

    expect(readPlayerGameReviewSummary(storage, "quality-game", moves, "black")).toEqual({
      reviewed: 2,
      best: 0,
      excellent: 0,
      good: 1,
      inaccuracies: 0,
      mistakes: 0,
      blunders: 1,
      averageCentipawnLoss: 210,
    });
  });

  it("rejects stale histories and caches with no reviewed player move", () => {
    const storage = memoryStorage();
    writeGameReviewCache(storage, "quality-game", 8, moves, {
      2: reviews[2],
      4: reviews[4],
    });

    expect(readPlayerGameReviewSummary(storage, "quality-game", [...moves, "f1c4"], "black")).toBeNull();
    expect(readPlayerGameReviewSummary(storage, "quality-game", moves, "white")).toBeNull();
  });
});
