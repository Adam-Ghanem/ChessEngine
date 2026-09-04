import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const analyzeSource = fs.readFileSync(path.resolve(__dirname, "pages/Analyze.tsx"), "utf8");

describe("Game Review side performance UI", () => {
  it("shows truthful per-side review coverage, average CPL, and errors from engine-backed verdicts", () => {
    expect(analyzeSource).toContain("summarizeMoveReviewsBySide");
    expect(analyzeSource).toContain("Side performance");
    expect(analyzeSource).toContain('aria-label="Per-side reviewed move summary"');
    expect(analyzeSource).toContain("Average CPL");
    expect(analyzeSource).toContain("Reviewed");
    expect(analyzeSource).toContain("Errors");
    expect(analyzeSource).toContain('gameContext.mode === "computer"');
    expect(analyzeSource).toContain('gameContext.playerSide === "white"');
    expect(analyzeSource).toContain('gameContext.playerSide === "black"');
  });
});
