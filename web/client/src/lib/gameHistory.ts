import type { PlayDifficultyId } from "@/engine/playDifficulty";
import type { PlayEngineStatus } from "@/engine/playEngine";
import type { PlayerSide } from "@/engine/playSide";
import type { PlayTimeControlId } from "@/engine/playTimeControl";

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
  whiteSeconds?: number;
  blackSeconds?: number;
  timeControlId?: PlayTimeControlId;
  playerSide?: PlayerSide;
  difficultyId?: PlayDifficultyId;
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

function isPlayerSide(value: unknown): value is PlayerSide {
  return value === "white" || value === "black";
}

function isTimeControlId(value: unknown): value is PlayTimeControlId {
  return value === "3" || value === "5" || value === "10" || value === "15";
}

function isDifficultyId(value: unknown): value is PlayDifficultyId {
  return value === "easy" || value === "medium" || value === "hard";
}

function isClock(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
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

function hasValidOptionalSession(game: Partial<StoredGame>) {
  return (game.whiteSeconds === undefined || isClock(game.whiteSeconds))
    && (game.blackSeconds === undefined || isClock(game.blackSeconds))
    && (game.timeControlId === undefined || isTimeControlId(game.timeControlId))
    && (game.playerSide === undefined || isPlayerSide(game.playerSide))
    && (game.difficultyId === undefined || isDifficultyId(game.difficultyId));
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
    && hasValidOptionalSession(game)
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

export function isResumableGame(game: StoredGame) {
  if (game.result || game.termination || (game.status !== "ongoing" && game.status !== "check")) return false;
  if (!game.positions || game.positions.length !== game.moves.length + 1 || game.positions.at(-1) !== game.fen) return false;
  if (!isClock(game.whiteSeconds) || !isClock(game.blackSeconds) || !isTimeControlId(game.timeControlId)) return false;
  if (game.mode === "computer" && (!isPlayerSide(game.playerSide) || !isDifficultyId(game.difficultyId))) return false;
  return true;
}

export function findResumableGame(gameId: string, storage: StorageLike | null = typeof window === "undefined" ? null : window.localStorage): StoredGame | null {
  const game = readGameHistory(storage).find(item => item.id === gameId);
  return game && isResumableGame(game) ? game : null;
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
