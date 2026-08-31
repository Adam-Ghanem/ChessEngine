import { describe, expect, it } from "vitest";
import { parseUciInfo, normalizeDepth } from "./engineProtocol";

describe("production ChessEngine protocol", () => {
  it("parses centipawn UCI info", () => {
    expect(parseUciInfo("info depth 6 score cp 42 pv e2e4 e7e5 g1f3")).toEqual({
      depth: 6,
      scoreCp: 42,
      principalVariation: "e2e4 e7e5 g1f3",
    });
  });

  it("normalizes mate scores and bounds requested depth", () => {
    expect(parseUciInfo("info depth 8 score mate -3 pv h7h8q").scoreCp).toBe(-10000);
    expect(normalizeDepth(0)).toBe(1);
    expect(normalizeDepth(99)).toBe(8);
    expect(normalizeDepth(5.9)).toBe(5);
  });
});
