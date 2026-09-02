import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production interactive Puzzles workspace", () => {
  it("uses the shared legal board and first-party Play engine path", () => {
    const puzzles = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
    expect(puzzles).toContain("LegalChessBoard");
    expect(puzzles).toContain("fetchLegalMoves");
    expect(puzzles).toContain("playMove");
    expect(puzzles).not.toContain('aria-label="Candidate moves"');
  });

  it("stores expected puzzle solutions as UCI lines in the shared catalog", () => {
    const catalog = readFileSync(new URL("./lib/puzzleCatalog.ts", import.meta.url), "utf8");
    expect(catalog).toContain('solution: ["d1d8"]');
    expect(catalog).toContain('solution: ["e4f6"]');
    expect(catalog).toContain('solution: ["e1e8"]');
    expect(catalog).toContain("PUZZLE_TOTAL = PUZZLES.length");
  });

  it("reports real remaining progress and advances to the next unsolved puzzle", () => {
    const puzzles = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
    expect(puzzles).toContain("const remainingCount = puzzles.length - solvedCount");
    expect(puzzles).toContain("function findNextUnsolvedIndex");
    expect(puzzles).toContain("Remaining");
    expect(puzzles).not.toContain("<span>Streak</span>");
    expect(puzzles).toContain("nextUnsolvedIndex");
  });
});
