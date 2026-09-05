import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const progress = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");

describe("Progress Game Review quality", () => {
  it("surfaces player-side persisted review evidence and a direct review handoff", () => {
    expect(progress).toContain("readPlayerGameReviewSummary");
    expect(progress).toContain("analysisHrefForGame");
    expect(progress).toContain("Latest Game Review");
    expect(progress).toContain("Average CPL");
    expect(progress).toContain("Mistakes");
    expect(progress).toContain("Blunders");
    expect(progress).toContain("Open reviewed game");
  });

  it("keeps the quality panel evidence-based when no reviewed player moves exist", () => {
    expect(progress).toContain("No reviewed ChessIQ game yet");
    expect(progress).toContain("Only first-party ChessEngine move reviews count here");
  });
});
