import { describe, expect, it } from "vitest";
import { analyzeWithChessEngine, parseEngineInfo } from "./engine";

describe("parseEngineInfo", () => {
  it("extracts a bounded UCI search result", () => {
    expect(parseEngineInfo("info depth 6 score cp -34 nodes 987 pv e2e4 e7e5")).toEqual({ depth: 6, scoreCp: -34, principalVariation: "e2e4 e7e5" });
  });

  it("normalizes a mate score into a durable analysis value", () => {
    expect(parseEngineInfo("info depth 4 score mate 2 pv h7h8q")).toMatchObject({ depth: 4, scoreCp: 10_000 });
  });

  it("returns a real legal move from the staged ChessEngine executable", async () => {
    const analysis = await analyzeWithChessEngine("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 2);
    expect(analysis.bestMove).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
    expect(analysis.depth).toBeGreaterThanOrEqual(1);
  }, 15_000);
});
