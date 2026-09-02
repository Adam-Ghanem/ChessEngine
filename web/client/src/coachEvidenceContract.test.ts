import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const coach = readFileSync(new URL("./pages/Coach.tsx", import.meta.url), "utf8");

describe("Coach evidence integrity", () => {
  it("counts completed lessons from the shared lesson catalog and progress helper", () => {
    expect(coach).toContain("LESSONS.filter");
    expect(coach).toContain("lesson.checkpoints.length");
    expect(coach).toContain("readNumberProgress");
    expect(coach).toContain("LEARN_STORAGE_KEY");
    expect(coach).not.toContain("value >= 3");
  });

  it("counts only unique puzzle ids that still exist in the shared catalog", () => {
    expect(coach).toContain("PUZZLE_IDS");
    expect(coach).toContain("new Set");
    expect(coach).toContain("PUZZLE_IDS.has");
  });

  it("uses the shared puzzle storage key", () => {
    expect(coach).toContain("PUZZLE_STORAGE_KEY");
    expect(coach).not.toContain('const PUZZLES_KEY = "chessiq-puzzles-solved-v1"');
  });
});
