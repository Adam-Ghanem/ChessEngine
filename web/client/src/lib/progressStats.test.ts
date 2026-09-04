import { describe, expect, it } from "vitest";
import type { StoredGame } from "@/lib/gameHistory";
import { summarizeComputerGameOutcomes, summarizeRecentComputerForm } from "@/lib/progressStats";

function game(overrides: Partial<StoredGame>): StoredGame {
  return {
    id: crypto.randomUUID(),
    mode: "computer",
    status: "checkmate",
    fen: "8/8/8/8/8/8/8/8 w - - 0 1",
    moves: ["e2e4"],
    result: "white-win",
    termination: "checkmate",
    playerSide: "white",
    updatedAt: "2026-09-04T09:00:00.000Z",
    ...overrides,
  };
}

describe("Progress computer game outcomes", () => {
  it("summarizes only completed computer games from the player's side", () => {
    const summary = summarizeComputerGameOutcomes([
      game({ id: "win-white", playerSide: "white", result: "white-win" }),
      game({ id: "win-black", playerSide: "black", result: "black-win" }),
      game({ id: "loss-black", playerSide: "black", result: "white-win" }),
      game({ id: "draw", status: "draw", playerSide: "white", result: "draw", termination: "draw" }),
      game({ id: "ongoing", status: "ongoing", result: undefined, termination: undefined }),
      game({ id: "legacy", playerSide: undefined }),
      game({ id: "local", mode: "local" }),
    ]);

    expect(summary).toEqual({ completed: 4, wins: 2, draws: 1, losses: 1 });
  });

  it("returns the five most recent verified computer results in saved-history order", () => {
    const form = summarizeRecentComputerForm([
      game({ id: "latest-win", playerSide: "black", result: "black-win" }),
      game({ id: "ongoing", status: "ongoing", result: undefined, termination: undefined }),
      game({ id: "draw", status: "draw", result: "draw", termination: "draw" }),
      game({ id: "loss", playerSide: "white", result: "black-win" }),
      game({ id: "local", mode: "local" }),
      game({ id: "win", playerSide: "white", result: "white-win" }),
      game({ id: "legacy", playerSide: undefined }),
      game({ id: "older-loss", playerSide: "black", result: "white-win" }),
      game({ id: "too-old-win", playerSide: "white", result: "white-win" }),
    ]);

    expect(form).toEqual(["win", "draw", "loss", "win", "loss"]);
  });
});
