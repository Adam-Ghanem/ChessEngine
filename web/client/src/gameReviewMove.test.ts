import { describe, expect, it } from "vitest";
import * as gameHistory from "@/lib/gameHistory";
import type { StoredGame } from "@/lib/gameHistory";
import { classifyMoveReview } from "@/lib/gameReview";

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
