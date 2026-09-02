import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const playSource = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
const analyzeSource = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");
const historySource = readFileSync(new URL("./lib/gameHistory.ts", import.meta.url), "utf8");

describe("ChessIQ saved-game replay contract", () => {
  it("persists position history for new saved games", () => {
    expect(historySource).toContain("positions?: string[]");
    expect(playSource).toContain("positions: history");
  });

  it("offers move-by-move replay when saved positions are available", () => {
    expect(analyzeSource).toContain("game-review-replay");
    expect(analyzeSource).toContain("Previous position");
    expect(analyzeSource).toContain("Next position");
    expect(analyzeSource).toContain("Back to final position");
  });

  it("lets reviewers jump directly to any recorded ply", () => {
    expect(analyzeSource).toContain("game-review-move-timeline");
    expect(analyzeSource).toContain('aria-label={`Jump to position ${index + 1} after ${move}`}');
    expect(analyzeSource).toContain('aria-current={replayIndex === index + 1 ? "step" : undefined}');
  });
});
