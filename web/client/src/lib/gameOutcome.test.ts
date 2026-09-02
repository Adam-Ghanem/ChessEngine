import { describe, expect, it } from "vitest";
import { gameOutcomeLabel } from "./gameOutcome";
import type { StoredGame } from "./gameHistory";

function game(overrides: Partial<StoredGame>): StoredGame {
  return {
    id: "g1",
    mode: "computer",
    status: "ongoing",
    fen: "8/8/8/8/8/8/8/8 w - - 0 1",
    moves: [],
    updatedAt: "2026-09-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("gameOutcomeLabel", () => {
  it("formats modern terminal outcomes consistently", () => {
    expect(gameOutcomeLabel(game({ result: "black-win", termination: "resignation" }))).toBe("Black wins · Resignation");
    expect(gameOutcomeLabel(game({ result: "white-win", termination: "timeout" }))).toBe("White wins · Time");
    expect(gameOutcomeLabel(game({ status: "checkmate", result: "black-win", termination: "checkmate" }))).toBe("Black wins · Checkmate");
    expect(gameOutcomeLabel(game({ status: "stalemate", result: "draw", termination: "stalemate" }))).toBe("Draw · Stalemate");
  });

  it("keeps legacy saved games readable", () => {
    expect(gameOutcomeLabel(game({ status: "check" }))).toBe("In check");
    expect(gameOutcomeLabel(game({ status: "ongoing" }))).toBe("In progress");
  });
});
