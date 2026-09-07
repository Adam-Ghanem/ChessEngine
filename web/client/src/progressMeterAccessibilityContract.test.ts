import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ Progress meter accessibility", () => {
  it("describes progress with meaningful counts instead of percent alone", () => {
    const progress = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");

    expect(progress).toContain("aria-valuetext={valueText}");
    expect(progress).toContain('valueText={`${snapshot.learnCheckpoints} of ${LEARN_TOTAL_CHECKPOINTS} checkpoints completed`}');
    expect(progress).toContain('valueText={`${snapshot.solvedPuzzles} of ${PUZZLE_TOTAL} puzzles solved`}');
    expect(progress).toContain('aria-valuetext={`${overallPercent}% of Learn and Puzzle training completed`}');
  });
});
