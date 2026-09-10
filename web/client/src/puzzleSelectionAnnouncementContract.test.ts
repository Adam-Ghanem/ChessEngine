import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const puzzlesSource = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");

describe("ChessIQ puzzle selection announcements", () => {
  it("announces the newly selected puzzle without moving focus", () => {
    expect(puzzlesSource).toContain('className="sr-only" role="status" aria-live="polite" aria-atomic="true"');
    expect(puzzlesSource).toContain("Puzzle {activeIndex + 1} of {puzzles.length}: {puzzle.title}. {puzzle.difficulty}. {puzzle.theme}.");
  });
});
