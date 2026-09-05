import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(new URL("./pages/Dashboard.tsx", import.meta.url), "utf8");

describe("Dashboard continuation flow", () => {
  it("derives the next action from persisted Game Review progress", () => {
    expect(dashboard).toContain("dashboardNextAction");
    expect(dashboard).toContain("readGameReviewProgress");
    expect(dashboard).toContain("latestReviewProgress");
    expect(dashboard).toContain("nextAction.href");
    expect(dashboard).toContain("nextAction.label");
    expect(dashboard).toContain("nextAction.copy");
  });

  it("keeps resumable games ahead of completed-game review and coaching", () => {
    expect(dashboard).toContain("snapshot.resumeGameId");
    expect(dashboard).toContain("latestCompletedGame");
    expect(dashboard).toMatch(/dashboardNextAction\([\s\S]*resumeGameId:\s*snapshot\.resumeGameId/);
  });
});
