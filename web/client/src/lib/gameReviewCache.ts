import type { PlayerSide } from "@/engine/playSide";
import type { ServerEngineAnalysis } from "@/engine/serverEngine";
import {
  summarizeMoveReviewsBySide,
  type MoveReviewClassification,
  type MoveReviewSummary,
} from "@/lib/gameReview";

export type CachedMoveReview = {
  ply: number;
  playedMove: string;
  analysis: ServerEngineAnalysis;
  afterAnalysis: ServerEngineAnalysis | null;
  classification: MoveReviewClassification | null;
};

export type GameReviewCache = Record<number, CachedMoveReview>;
export type GameReviewProgress = {
  reviewed: number;
  total: number;
  depth: number;
};

type ReviewStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type StoredReviewCache = {
  depth: number;
  historyFingerprint: string;
  reviews: GameReviewCache;
};

const CACHE_PREFIX = "chessiq:game-review:v1:";

function cacheKey(gameId: string) {
  return `${CACHE_PREFIX}${gameId}`;
}

function fingerprintMoves(moves: readonly string[]) {
  return JSON.stringify(moves);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEngineAnalysis(value: unknown): value is ServerEngineAnalysis {
  if (!isRecord(value)) return false;
  return typeof value.bestMove === "string"
    && typeof value.scoreCp === "number"
    && Number.isFinite(value.scoreCp)
    && typeof value.depth === "number"
    && Number.isFinite(value.depth)
    && typeof value.principalVariation === "string"
    && typeof value.engine === "string";
}

function isClassification(value: unknown): value is MoveReviewClassification | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  const labels = new Set(["Best move", "Excellent", "Good", "Inaccuracy", "Mistake", "Blunder"]);
  return typeof value.label === "string"
    && labels.has(value.label)
    && typeof value.centipawnLoss === "number"
    && Number.isFinite(value.centipawnLoss)
    && value.centipawnLoss >= 0;
}

function isCachedMoveReview(value: unknown, expectedPly: number): value is CachedMoveReview {
  if (!isRecord(value)) return false;
  return value.ply === expectedPly
    && typeof value.playedMove === "string"
    && isEngineAnalysis(value.analysis)
    && (value.afterAnalysis === null || isEngineAnalysis(value.afterAnalysis))
    && isClassification(value.classification);
}

function parseReviews(value: unknown): GameReviewCache | null {
  if (!isRecord(value)) return null;
  const reviews: GameReviewCache = {};
  for (const [key, review] of Object.entries(value)) {
    const ply = Number(key);
    if (!Number.isInteger(ply) || ply < 1 || !isCachedMoveReview(review, ply)) return null;
    reviews[ply] = review;
  }
  return reviews;
}

function parseStoredReviewCache(raw: string | null): StoredReviewCache | null {
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) return null;
  if (typeof parsed.depth !== "number" || !Number.isFinite(parsed.depth) || parsed.depth < 1) return null;
  if (typeof parsed.historyFingerprint !== "string") return null;
  const reviews = parseReviews(parsed.reviews);
  if (!reviews) return null;
  return {
    depth: parsed.depth,
    historyFingerprint: parsed.historyFingerprint,
    reviews,
  };
}

export function readGameReviewCache(
  storage: ReviewStorage,
  gameId: string,
  depth: number,
  moves: readonly string[],
): GameReviewCache {
  try {
    const parsed = parseStoredReviewCache(storage.getItem(cacheKey(gameId)));
    if (!parsed) return {};
    if (parsed.depth !== depth || parsed.historyFingerprint !== fingerprintMoves(moves)) return {};
    return parsed.reviews;
  } catch {
    return {};
  }
}

export function readGameReviewProgress(
  storage: ReviewStorage,
  gameId: string,
  moves: readonly string[],
): GameReviewProgress | null {
  try {
    const parsed = parseStoredReviewCache(storage.getItem(cacheKey(gameId)));
    if (!parsed || parsed.historyFingerprint !== fingerprintMoves(moves)) return null;
    return {
      reviewed: Object.keys(parsed.reviews).length,
      total: moves.length,
      depth: parsed.depth,
    };
  } catch {
    return null;
  }
}

export function readPlayerGameReviewSummary(
  storage: ReviewStorage,
  gameId: string,
  moves: readonly string[],
  playerSide: PlayerSide,
): MoveReviewSummary | null {
  try {
    const parsed = parseStoredReviewCache(storage.getItem(cacheKey(gameId)));
    if (!parsed || parsed.historyFingerprint !== fingerprintMoves(moves)) return null;

    const summaryBySide = summarizeMoveReviewsBySide(Object.values(parsed.reviews));
    const summary = summaryBySide[playerSide];
    return summary.reviewed > 0 ? summary : null;
  } catch {
    return null;
  }
}

export function writeGameReviewCache(
  storage: ReviewStorage,
  gameId: string,
  depth: number,
  moves: readonly string[],
  reviews: GameReviewCache,
) {
  const payload: StoredReviewCache = {
    depth,
    historyFingerprint: fingerprintMoves(moves),
    reviews,
  };

  try {
    storage.setItem(cacheKey(gameId), JSON.stringify(payload));
  } catch {
    // Storage can be unavailable or quota-limited. Review remains usable in memory.
  }
}

export function clearGameReviewCache(storage: ReviewStorage, gameId: string) {
  try {
    storage.removeItem(cacheKey(gameId));
  } catch {
    // Treat storage cleanup as best effort.
  }
}
