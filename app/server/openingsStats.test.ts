import { describe, expect, it, vi } from "vitest";
import {
  normalizeOpeningPosition,
  parseLichessOpeningStats,
  resolveOpeningStats,
  type CachedOpeningStats,
} from "./openingsStats";

const NOW = new Date("2026-09-08T02:00:00.000Z");
const FEN = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
const LIVE_PAYLOAD = {
  white: 120,
  draws: 50,
  black: 80,
  moves: [
    { uci: "f1b5", san: "Bb5", white: 60, draws: 20, black: 30, averageRating: 2440 },
    { uci: "f1c4", san: "Bc4", white: 40, draws: 20, black: 20, averageRating: 2410 },
  ],
};

describe("opening statistics boundary", () => {
  it("normalizes a FEN to position identity without move counters", () => {
    expect(normalizeOpeningPosition(FEN)).toBe("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -");
  });

  it("validates and converts a Lichess Explorer payload", () => {
    const parsed = parseLichessOpeningStats(LIVE_PAYLOAD);
    expect(parsed?.moves[0]).toEqual({
      uci: "f1b5",
      san: "Bb5",
      games: 110,
      white: 60,
      draws: 20,
      black: 30,
      averageRating: 2440,
    });
    expect(parsed?.totalGames).toBe(250);
  });

  it("rejects malformed or negative external statistics", () => {
    expect(parseLichessOpeningStats({ moves: [{ uci: "bad", san: "?", white: -1, draws: 0, black: 0 }] })).toBeNull();
    expect(parseLichessOpeningStats({ moves: "not-an-array" })).toBeNull();
  });

  it("returns a fresh cache without making a network call", async () => {
    const cached: CachedOpeningStats = {
      positionKey: normalizeOpeningPosition(FEN),
      payload: parseLichessOpeningStats(LIVE_PAYLOAD)!,
      fetchedAt: new Date("2026-09-08T01:30:00.000Z"),
    };
    const fetchLive = vi.fn();
    const result = await resolveOpeningStats({
      fen: FEN,
      now: NOW,
      readCache: async () => cached,
      writeCache: async () => undefined,
      fetchLive,
      freshForMs: 60 * 60 * 1000,
    });
    expect(fetchLive).not.toHaveBeenCalled();
    expect(result.status).toBe("live");
    expect(result.cached).toBe(true);
  });

  it("falls back to stale persisted data when live fetch fails", async () => {
    const cached: CachedOpeningStats = {
      positionKey: normalizeOpeningPosition(FEN),
      payload: parseLichessOpeningStats(LIVE_PAYLOAD)!,
      fetchedAt: new Date("2026-09-01T00:00:00.000Z"),
    };
    const result = await resolveOpeningStats({
      fen: FEN,
      now: NOW,
      readCache: async () => cached,
      writeCache: async () => undefined,
      fetchLive: async () => { throw new Error("timeout"); },
      freshForMs: 60 * 60 * 1000,
    });
    expect(result.status).toBe("stale");
    expect(result.cached).toBe(true);
    expect(result.moves).toHaveLength(2);
  });

  it("returns unavailable and never fabricates numbers without live or cached data", async () => {
    const result = await resolveOpeningStats({
      fen: FEN,
      now: NOW,
      readCache: async () => null,
      writeCache: async () => undefined,
      fetchLive: async () => { throw new Error("rate limited"); },
    });
    expect(result).toEqual({ status: "unavailable", cached: false, totalGames: 0, moves: [] });
  });

  it("persists a validated live response", async () => {
    const writeCache = vi.fn(async () => undefined);
    const result = await resolveOpeningStats({
      fen: FEN,
      now: NOW,
      readCache: async () => null,
      writeCache,
      fetchLive: async () => LIVE_PAYLOAD,
    });
    expect(result.status).toBe("live");
    expect(result.cached).toBe(false);
    expect(writeCache).toHaveBeenCalledTimes(1);
    expect(writeCache.mock.calls[0]?.[0].positionKey).toBe(normalizeOpeningPosition(FEN));
  });
});
