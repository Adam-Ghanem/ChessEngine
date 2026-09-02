import { describe, expect, it } from "vitest";
import { readNumberProgress, writeNumberProgress } from "./localProgress";

function storageWith(initial?: Record<string, string>): Storage {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    clear: () => data.clear(),
    key: (index) => Array.from(data.keys())[index] ?? null,
    get length() { return data.size; },
  } as Storage;
}

describe("local numeric progress", () => {
  it("falls back to empty progress for corrupt or non-object storage", () => {
    expect(readNumberProgress(storageWith({ x: "{bad" }), "x")).toEqual({});
    expect(readNumberProgress(storageWith({ x: "[]" }), "x")).toEqual({});
  });

  it("keeps only finite non-negative integer values", () => {
    const storage = storageWith({ x: JSON.stringify({ a: 2, b: -1, c: 2.8, d: "3", e: null, f: Infinity }) });
    expect(readNumberProgress(storage, "x")).toEqual({ a: 2, c: 2 });
  });

  it("round-trips numeric progress", () => {
    const storage = storageWith();
    writeNumberProgress(storage, "x", { lesson: 2 });
    expect(readNumberProgress(storage, "x")).toEqual({ lesson: 2 });
  });
});
