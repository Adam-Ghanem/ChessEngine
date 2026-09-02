import type { PlayEngineStatus } from "@/engine/playEngine";

export const GAME_HISTORY_KEY = "chessiq.games.v1";
const MAX_GAMES = 20;

export type GameResult = "white-win" | "black-win" | "draw";
export type GameTermination = "checkmate" | "stalemate" | "draw" | "timeout" | "resignation";

export type StoredGame = {
  id: string;
  mode: "computer" | "local";
  status: PlayEngineStatus;
  fen: string;
  moves: string[];
  positions?: string[];
  result?: GameResult;
  termination?: GameTermination;
  updatedAt: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isGameResult(value: unknown): value is GameResult {
  return value === "white-win" || value === "black-win" || value === "draw";
}

function isGameTermination(value: unknown): value is GameTermination {
  return value === "checkmate" || value === "stalemate" || value === "draw" || value === "timeout" || value === "resignation";
}

function isEngineStatus(value: unknown): value is PlayEngineStatus {
  return value === "ongoing" || value === "check" || value === "checkmate" || value === "stalemate" || value === "draw";
}

function hasValidOutcome(game: Partial<StoredGame>) {
  if (game.result === undefined && game.termination === undefined) return true;
  if (!isGameResult(game.result) || !isGameTermination(game.termination) || !isEngineStatus(game.status)) return false;

  if (game.termination === "checkmate") {
    return game.status === "checkmate" && game.result !== "draw";
  }
  if (game.termination === "stalemate") {
    return game.status === "stalemate" && game.result === "draw";
  }
  if (game.termination === "draw") {
    return game.status === "draw" && game.result === "draw";
  }
  return (game.status === "ongoing" || game.status === "check") && game.result !== "draw";
}

function isStoredGame(value: unknown): value is StoredGame {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<StoredGame>;
  return typeof game.id === "string"
    && (game.mode === "computer" || game.mode === "local")
    && isEngineStatus(game.status)
    && typeof game.fen === "string"
    && Array.isArray(game.moves)
    && game.moves.every(move => typeof move === "string")
    && (game.positions === undefined || (Array.isArray(game.positions) && game.positions.every(position => typeof position === "string")))
    && hasValidOutcome(game)
    && typeof game.updatedAt === "string";
}

export function readGameHistory(storage: StorageLike | null = typeof window === "undefined" ? null : window.localStorage): StoredGame[] {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(GAME_HISTORY_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredGame).slice(0, MAX_GAMES);
  } catch {
    return [];
  }
}

export function saveGameSnapshot(game: StoredGame, storage: StorageLike | null = typeof window === "undefined" ? null : window.localStorage) {
  if (!storage) return;
  const history = readGameHistory(storage).filter(item => item.id !== game.id);
  storage.setItem(GAME_HISTORY_KEY, JSON.stringify([game, ...history].slice(0, MAX_GAMES)));
}

export function deleteGameHistory(gameId: string, storage: StorageLike | null = typeof window === "undefined" ? null : window.localStorage) {
  if (!storage) return;
  const history = readGameHistory(storage).filter(item => item.id !== gameId);
  if (history.length === 0) {
    storage.removeItem(GAME_HISTORY_KEY);
    return;
  }
  storage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
}

export function clearGameHistory(storage: StorageLike | null = typeof window === "undefined" ? null : window.localStorage) {
  storage?.removeItem(GAME_HISTORY_KEY);
}
