import { eq } from "drizzle-orm";
import { Chess } from "chess.js";
import { openingStatsCache, type OpeningStatsCachePayload } from "../drizzle/schema";
import { getDb } from "./db";

export type OpeningStatsMove = OpeningStatsCachePayload["moves"][number];
export type OpeningStatsPayload = OpeningStatsCachePayload;
export type OpeningStatsStatus = "live" | "stale" | "unavailable";

export type OpeningStatsResult = OpeningStatsPayload & {
  status: OpeningStatsStatus;
  cached: boolean;
};

export type CachedOpeningStats = {
  positionKey: string;
  payload: OpeningStatsPayload;
  fetchedAt: Date;
};

type ResolveOpeningStatsDeps = {
  fen: string;
  now?: Date;
  readCache: (positionKey: string) => Promise<CachedOpeningStats | null>;
  writeCache: (value: CachedOpeningStats) => Promise<unknown>;
  fetchLive: (fen: string) => Promise<unknown>;
  freshForMs?: number;
  staleForMs?: number;
};

const DEFAULT_FRESH_MS = 6 * 60 * 60 * 1000;
const DEFAULT_STALE_MS = 30 * 24 * 60 * 60 * 1000;
const LICHESS_TIMEOUT_MS = 3_500;

function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isUciMove(value: unknown): value is string {
  return typeof value === "string" && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value);
}

export function normalizeOpeningPosition(fen: string) {
  const chess = new Chess(fen);
  return chess.fen().split(" ").slice(0, 4).join(" ");
}

export function parseLichessOpeningStats(input: unknown): OpeningStatsPayload | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  if (!isNonNegativeFinite(value.white) || !isNonNegativeFinite(value.draws) || !isNonNegativeFinite(value.black)) return null;
  if (!Array.isArray(value.moves)) return null;

  const moves: OpeningStatsMove[] = [];
  for (const rawMove of value.moves) {
    if (!rawMove || typeof rawMove !== "object") return null;
    const move = rawMove as Record<string, unknown>;
    if (!isUciMove(move.uci) || typeof move.san !== "string" || move.san.trim().length === 0) return null;
    if (!isNonNegativeFinite(move.white) || !isNonNegativeFinite(move.draws) || !isNonNegativeFinite(move.black)) return null;
    if (move.averageRating !== undefined && !isNonNegativeFinite(move.averageRating)) return null;

    moves.push({
      uci: move.uci,
      san: move.san,
      games: move.white + move.draws + move.black,
      white: move.white,
      draws: move.draws,
      black: move.black,
      ...(move.averageRating === undefined ? {} : { averageRating: move.averageRating }),
    });
  }

  return {
    totalGames: value.white + value.draws + value.black,
    moves,
  };
}

function unavailable(): OpeningStatsResult {
  return { status: "unavailable", cached: false, totalGames: 0, moves: [] };
}

function cachedResult(cache: CachedOpeningStats, status: "live" | "stale"): OpeningStatsResult {
  return { status, cached: true, ...cache.payload };
}

export async function resolveOpeningStats({
  fen,
  now = new Date(),
  readCache,
  writeCache,
  fetchLive,
  freshForMs = DEFAULT_FRESH_MS,
  staleForMs = DEFAULT_STALE_MS,
}: ResolveOpeningStatsDeps): Promise<OpeningStatsResult> {
  const positionKey = normalizeOpeningPosition(fen);
  let cached: CachedOpeningStats | null = null;
  try {
    cached = await readCache(positionKey);
  } catch {
    cached = null;
  }

  const cachedAge = cached ? Math.max(0, now.getTime() - cached.fetchedAt.getTime()) : Number.POSITIVE_INFINITY;
  if (cached && cachedAge <= freshForMs) return cachedResult(cached, "live");

  try {
    const external = await fetchLive(fen);
    const payload = parseLichessOpeningStats(external);
    if (!payload) throw new Error("Opening Explorer returned malformed statistics");
    const nextCache: CachedOpeningStats = { positionKey, payload, fetchedAt: now };
    try {
      await writeCache(nextCache);
    } catch {
      // Live statistics remain useful even when persistence is temporarily unavailable.
    }
    return { status: "live", cached: false, ...payload };
  } catch {
    if (cached && cachedAge <= staleForMs) return cachedResult(cached, "stale");
    return unavailable();
  }
}

async function readPersistentCache(positionKey: string): Promise<CachedOpeningStats | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(openingStatsCache).where(eq(openingStatsCache.positionKey, positionKey)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return { positionKey: row.positionKey, payload: row.payload, fetchedAt: row.fetchedAt };
}

async function writePersistentCache(value: CachedOpeningStats) {
  const db = await getDb();
  if (!db) return;
  await db.insert(openingStatsCache).values(value).onDuplicateKeyUpdate({
    set: { payload: value.payload, fetchedAt: value.fetchedAt },
  });
}

export async function fetchLichessOpeningStats(fen: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LICHESS_TIMEOUT_MS);
  try {
    const url = new URL("https://explorer.lichess.ovh/masters");
    url.searchParams.set("fen", fen);
    url.searchParams.set("moves", "16");
    url.searchParams.set("topGames", "0");
    url.searchParams.set("recentGames", "0");
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "ChessIQ opening explorer" },
    });
    if (!response.ok) throw new Error(`Lichess Opening Explorer returned ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function getOpeningStats(fen: string) {
  return resolveOpeningStats({
    fen,
    readCache: readPersistentCache,
    writeCache: writePersistentCache,
    fetchLive: fetchLichessOpeningStats,
  });
}
