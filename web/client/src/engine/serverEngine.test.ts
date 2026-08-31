import { describe, expect, it } from "vitest";
import { normalizeServerAnalysis } from "./serverEngine";

describe("production server ChessEngine client", () => {
  it("normalizes a successful server analysis payload", () => {
    expect(normalizeServerAnalysis({
      bestMove: "e2e4",
      scoreCp: 31,
      depth: 5,
      principalVariation: "e2e4 e7e5 g1f3",
      engine: "ChessEngine 0.3",
    })).toEqual({
      bestMove: "e2e4",
      scoreCp: 31,
      depth: 5,
      principalVariation: "e2e4 e7e5 g1f3",
      engine: "ChessEngine 0.3",
    });
  });

  it("rejects incomplete payloads", () => {
    expect(() => normalizeServerAnalysis({ bestMove: "e2e4" })).toThrow("Invalid ChessEngine response");
  });
});
