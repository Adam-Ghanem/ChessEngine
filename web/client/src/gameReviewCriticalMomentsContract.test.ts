import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const analyzeSource = fs.readFileSync(path.resolve(__dirname, "pages/Analyze.tsx"), "utf8");

describe("Game Review critical moments UI", () => {
  it("surfaces ranked engine-reviewed errors and lets users jump to their positions", () => {
    expect(analyzeSource).toContain("rankCriticalReviewMoments");
    expect(analyzeSource).toContain("Critical moments");
    expect(analyzeSource).toContain("selectReplayPosition(moment.ply)");
    expect(analyzeSource).toContain('aria-label="Critical review moments"');
    expect(analyzeSource).toContain("centipawn loss");
  });
});
