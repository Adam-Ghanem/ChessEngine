import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(new URL("./pages/Dashboard.tsx", import.meta.url), "utf8");

describe("Dashboard continuation flow", () => {
  it("deep-links the latest verified completed ChessIQ game into Game Review", () => {
    expect(dashboard).toContain("latestCompletedComputerGame");
    expect(dashboard).toContain("analysisHrefForGame");
    expect(dashboard).toContain("latestCompletedGame.fen");
    expect(dashboard).toContain("latestCompletedGame.id");
    expect(dashboard).toContain("Review latest game");
  });

  it("keeps resumable games ahead of completed-game review", () => {
    expect(dashboard).toContain("snapshot.resumeGameId");
    expect(dashboard).toContain("latestCompletedGame");
    expect(dashboard).toMatch(/snapshot\.resumeGameId[\s\S]*latestCompletedGame/);
  });
});
