import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { restoreChess } from "./chessGame";

describe("ChessIQ legal game helpers", () => {
  it("restores a persisted UCI game into its current position", () => {
    const chess = restoreChess(new Chess().fen(), ["e2e4", "e7e5"]);
    expect(chess.fen()).toContain(" w ");
    expect(chess.pgn()).toContain("1. e4 e5");
  });

  it("accepts every standard promotion choice", () => {
    for (const promotion of ["q", "r", "b", "n"] as const) {
      const chess = new Chess("8/P7/8/8/8/8/7p/4K2k w - - 0 1");
      expect(chess.move({ from: "a7", to: "a8", promotion })).toMatchObject({ promotion });
    }
  });
});
