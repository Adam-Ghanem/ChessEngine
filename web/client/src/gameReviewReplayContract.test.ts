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

  it("lets reviewers jump directly to any recorded ply and exposes reviewed move context", () => {
    expect(analyzeSource).toContain("game-review-move-timeline");
    expect(analyzeSource).toContain('aria-label={`Jump to position ${index + 1} after ${move}${reviewed ?');
    expect(analyzeSource).toContain("Reviewed: ${reviewed.label}, ${reviewed.centipawnLoss} centipawn loss");
    expect(analyzeSource).toContain('aria-current={isCurrent ? "step" : undefined}');
    expect(analyzeSource).toContain("game-review-timeline-verdict");
  });

  it("supports focused keyboard-first replay navigation", () => {
    expect(analyzeSource).toContain("tabIndex={0}");
    expect(analyzeSource).toContain("onKeyDown={(event) => {");
    expect(analyzeSource).toContain('event.key === "ArrowLeft"');
    expect(analyzeSource).toContain('event.key === "ArrowRight"');
    expect(analyzeSource).toContain('event.key === "Home"');
    expect(analyzeSource).toContain('event.key === "End"');
    expect(analyzeSource).toContain('aria-describedby="game-review-keyboard-hint"');
    expect(analyzeSource).toContain("Keyboard: ←/→ step · Home start · End final");
  });
});
