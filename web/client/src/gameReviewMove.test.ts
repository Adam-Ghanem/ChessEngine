import { describe, expect, it } from "vitest";
import * as gameHistory from "@/lib/gameHistory";
import type { StoredGame } from "@/lib/gameHistory";
import { classifyMoveReview, summarizeMoveReviews } from "@/lib/gameReview";
import { readGameReviewCache, writeGameReviewCache } from "@/lib/gameReviewCache";

type ReplayMoveContext = {
  ply: number;
  positionBeforeFen: string;
  playedMove: string;
};

type ReplayMoveContextFn = (game: StoredGame, replayIndex: number) => ReplayMoveContext | null;

const replayMoveContext = (gameHistory as unknown as { replayMoveContext?: ReplayMoveContextFn }).replayMoveContext;

const game: StoredGame = {
  id: "review-game",
  mode: "local",
  status: "ongoing",
  fen: "fen-after-2",
  moves: ["e2e4", "e7e5"],
  positions: ["fen-start", "fen-after-1", "fen-after-2"],
  updatedAt: "2026-09-03T20:00:00.000Z",
};

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

describe("selected move review context", () => {
  it("derives the position before the selected recorded move", () => {
    expect(replayMoveContext).toBeTypeOf("function");
    if (!replayMoveContext) return;

    expect(replayMoveContext(game, 2)).toEqual({
      ply: 2,
      positionBeforeFen: "fen-after-1",
      playedMove: "e7e5",
    });
  });

  it("refuses the starting position, invalid plies, and inconsistent histories", () => {
    expect(replayMoveContext).toBeTypeOf("function");
    if (!replayMoveContext) return;

    expect(replayMoveContext(game, 0)).toBeNull();
    expect(replayMoveContext(game, 3)).toBeNull();
    expect(replayMoveContext({ ...game, positions: ["fen-start", "fen-after-1"] }, 1)).toBeNull();
  });
});

describe("engine-backed move classification", () => {
  it("marks an engine-matching move as best with zero loss", () => {
    expect(classifyMoveReview({ bestMoveMatch: true, beforeScoreCp: 80, afterScoreCp: 40 })).toEqual({
      label: "Best move",
      centipawnLoss: 0,
    });
  });

  it("classifies non-best moves from same-player centipawn loss", () => {
    expect(classifyMoveReview({ bestMoveMatch: false, beforeScoreCp: 50, afterScoreCp: -35 })).toEqual({ label: "Excellent", centipawnLoss: 15 });
    expect(classifyMoveReview({ bestMoveMatch: false, beforeScoreCp: 40, afterScoreCp: 0 })).toEqual({ label: "Good", centipawnLoss: 40 });
    expect(classifyMoveReview({ bestMoveMatch: false, beforeScoreCp: 70, afterScoreCp: 10 })).toEqual({ label: "Inaccuracy", centipawnLoss: 80 });
    expect(classifyMoveReview({ bestMoveMatch: false, beforeScoreCp: 110, afterScoreCp: 30 })).toEqual({ label: "Mistake", centipawnLoss: 140 });
    expect(classifyMoveReview({ bestMoveMatch: false, beforeScoreCp: 150, afterScoreCp: 120 })).toEqual({ label: "Blunder", centipawnLoss: 270 });
  });

  it("clamps search noise instead of reporting negative loss", () => {
    expect(classifyMoveReview({ bestMoveMatch: false, beforeScoreCp: 20, afterScoreCp: -60 })).toEqual({
      label: "Excellent",
      centipawnLoss: 0,
    });
  });
});

describe("reviewed move session summary", () => {
  it("summarizes only engine-backed classifications that were actually reviewed", () => {
    expect(summarizeMoveReviews([
      { label: "Best move", centipawnLoss: 0 },
      { label: "Good", centipawnLoss: 42 },
      null,
      { label: "Blunder", centipawnLoss: 260 },
    ])).toEqual({
      reviewed: 3,
      best: 1,
      excellent: 0,
      good: 1,
      inaccuracies: 0,
      mistakes: 0,
      blunders: 1,
      averageCentipawnLoss: 101,
    });
  });

  it("returns a zeroed summary when no move has a trustworthy classification", () => {
    expect(summarizeMoveReviews([null, null])).toEqual({
      reviewed: 0,
      best: 0,
      excellent: 0,
      good: 0,
      inaccuracies: 0,
      mistakes: 0,
      blunders: 0,
      averageCentipawnLoss: 0,
    });
  });
});

describe("persisted game review cache", () => {
  it("restores reviewed moves only for the same game history and engine depth", () => {
    const storage = memoryStorage();
    const reviews = {
      1: {
        ply: 1,
        playedMove: "e2e4",
        analysis: { bestMove: "e2e4", scoreCp: 24, depth: 6, principalVariation: "e2e4 e7e5", engine: "ChessEngine" },
        afterAnalysis: null,
        classification: { label: "Best move" as const, centipawnLoss: 0 },
      },
    };

    writeGameReviewCache(storage, game.id, 6, game.moves, reviews);

    expect(readGameReviewCache(storage, game.id, 6, game.moves)).toEqual(reviews);
    expect(readGameReviewCache(storage, game.id, 8, game.moves)).toEqual({});
    expect(readGameReviewCache(storage, game.id, 6, [...game.moves, "g1f3"])).toEqual({});
  });

  it("ignores malformed cached review data instead of breaking Analyze", () => {
    const storage = memoryStorage();
    storage.setItem("chessiq:game-review:v1:review-game", "not-json");

    expect(readGameReviewCache(storage, game.id, 6, game.moves)).toEqual({});
  });
});
