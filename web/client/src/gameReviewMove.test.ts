import { describe, expect, it } from "vitest";
import * as gameHistory from "@/lib/gameHistory";
import type { StoredGame } from "@/lib/gameHistory";

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
