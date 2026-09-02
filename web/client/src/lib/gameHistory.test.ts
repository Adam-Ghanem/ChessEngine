import { describe, expect, it } from "vitest";
import { GAME_HISTORY_KEY, deleteGameHistory, readGameHistory, type StoredGame } from "./gameHistory";

function storageWith(games: unknown[]): Storage {
  const data = new Map<string, string>([[GAME_HISTORY_KEY, JSON.stringify(games)]]);
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    clear: () => data.clear(),
    key: (index) => Array.from(data.keys())[index] ?? null,
    get length() { return data.size; },
  } as Storage;
}

const game = (id: string): StoredGame => ({
  id,
  mode: "computer",
  status: "ongoing",
  fen: "8/8/8/8/8/8/8/8 w - - 0 1",
  moves: ["e2e4"],
  positions: ["8/8/8/8/8/8/8/8 w - - 0 1", "8/8/8/8/8/8/8/8 b - - 0 1"],
  updatedAt: "2026-09-02T12:00:00.000Z",
});

describe("game history deletion", () => {
  it("removes only the selected game and preserves the remaining records", () => {
    const storage = storageWith([game("a"), game("b"), game("c")]);

    deleteGameHistory("b", storage);

    expect(readGameHistory(storage).map(item => item.id)).toEqual(["a", "c"]);
    expect(readGameHistory(storage)[0].positions).toHaveLength(2);
  });

  it("removes the storage key when the final game is deleted", () => {
    const storage = storageWith([game("only")]);

    deleteGameHistory("only", storage);

    expect(storage.getItem(GAME_HISTORY_KEY)).toBeNull();
    expect(readGameHistory(storage)).toEqual([]);
  });
});

describe("game history outcomes", () => {
  it("rejects records with unsupported termination metadata instead of trusting corrupted local data", () => {
    const corrupted = { ...game("bad"), termination: "abandoned", result: "white-win" };
    const storage = storageWith([corrupted]);

    expect(readGameHistory(storage)).toEqual([]);
  });

  it("rejects terminal metadata that contradicts the engine terminal status", () => {
    const corrupted = { ...game("bad-status"), termination: "checkmate", result: "black-win" };
    const storage = storageWith([corrupted]);

    expect(readGameHistory(storage)).toEqual([]);
  });
});
