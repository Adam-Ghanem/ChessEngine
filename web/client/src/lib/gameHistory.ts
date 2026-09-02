import type { PlayEngineStatus } from "@/engine/playEngine";

export const GAME_HISTORY_KEY = "chessiq.games.v1";
const MAX_GAMES = 20;

export type StoredGame = {
  id: string;
  mode: "computer" | "local";
  status: PlayEngineStatus;
  fen: string;
  moves: string[];
  positions?: string[];
  updatedAt: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isStoredGame(value: unknown): value is StoredGame {
  if (!value || typeof value !== "object") return false;
  const game = value as Partial<StoredGame>;
  return typeof game.id === "string"
    && (game.mode === "computer" || game.mode === "local")
    && typeof game.status === "string"
    && typeof game.fen === "string"
    && Array.isArray(game.moves)
    && game.moves.every(move => typeof move === "string")
    && (game.positions === undefined || (Array.isArray(game.positions) && game.positions.every(position => typeof position === "string")))
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

export function clearGameHistory(storage: StorageLike | null = typeof window === "undefined" ? null : window.localStorage) {
  storage?.removeItem(GAME_HISTORY_KEY);
}
