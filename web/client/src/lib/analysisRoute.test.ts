import { describe, expect, it } from "vitest";
import { analysisHrefForFen, initialAnalysisFenFromSearch } from "./analysisRoute";

const FEN = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/4P3/PPPP1PPP/RNBQKBNR w KQkq - 1 3";
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("analysis route handoff", () => {
  it("encodes a saved game FEN into the Analyze route", () => {
    const href = analysisHrefForFen(FEN);
    expect(href).toBe(`/analyze?fen=${encodeURIComponent(FEN)}`);
  });

  it("loads a valid FEN from the query string", () => {
    expect(initialAnalysisFenFromSearch(`?fen=${encodeURIComponent(FEN)}`, START_FEN)).toBe(FEN);
  });

  it("falls back safely when the query FEN is invalid or missing", () => {
    expect(initialAnalysisFenFromSearch("?fen=not-a-fen", START_FEN)).toBe(START_FEN);
    expect(initialAnalysisFenFromSearch("", START_FEN)).toBe(START_FEN);
  });
});
