import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzePosition, normalizeServerAnalysis } from "./serverEngine";

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it("forwards an AbortSignal so long-running review requests can be cancelled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      bestMove: "e2e4",
      scoreCp: 31,
      depth: 5,
      principalVariation: "e2e4 e7e5",
      engine: "ChessEngine 0.3",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    await analyzePosition("start-fen", 5, signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/analyze", expect.objectContaining({ signal }));
  });
});
