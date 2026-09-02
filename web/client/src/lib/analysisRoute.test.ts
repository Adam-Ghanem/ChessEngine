import { describe, expect, it } from "vitest";
import {
  analysisHrefForFen,
  analysisHrefForGame,
  initialAnalysisFenFromSearch,
  initialAnalysisGameIdFromSearch,
} from "./analysisRoute";

const FEN = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/4P3/PPPP1PPP/RNBQKBNR w KQkq - 1 3";
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("analysis route handoff", () => {
  it("encodes a saved game FEN into the Analyze route", () => {
    const href = analysisHrefForFen(FEN);
    expect(href).toBe(`/analyze?fen=${encodeURIComponent(FEN)}`);
  });

  it("preserves saved-game context when opening Analyze from Games", () => {
    const href = analysisHrefForGame(FEN, "game-123");
    expect(href).toBe(`/analyze?fen=${encodeURIComponent(FEN)}&game=game-123`);
    expect(initialAnalysisGameIdFromSearch("?fen=x&game=game-123")).toBe("game-123");
  });

  it("rejects empty or oversized game identifiers", () => {
    expect(initialAnalysisGameIdFromSearch("?game=")).toBeNull();
    expect(initialAnalysisGameIdFromSearch(`?game=${"x".repeat(201)}`)).toBeNull();
  });

  it("loads a valid FEN from the query string", () => {
    expect(initialAnalysisFenFromSearch(`?fen=${encodeURIComponent(FEN)}`, START_FEN)).toBe(FEN);
  });

  it("falls back safely when the query FEN is invalid or missing", () => {
    expect(initialAnalysisFenFromSearch("?fen=not-a-fen", START_FEN)).toBe(START_FEN);
    expect(initialAnalysisFenFromSearch("", START_FEN)).toBe(START_FEN);
  });
});
