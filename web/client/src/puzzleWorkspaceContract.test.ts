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

  it("stores expected puzzle solutions as UCI lines", () => {
    const puzzles = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
    expect(puzzles).toContain('solution: ["d1d8"]');
    expect(puzzles).toContain('solution: ["e4f6"]');
    expect(puzzles).toContain('solution: ["e1e8"]');
  });
});
