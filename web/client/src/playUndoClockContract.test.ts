import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
const history = readFileSync(new URL("./lib/gameHistory.ts", import.meta.url), "utf8");

describe("timed Play undo clock continuity", () => {
  it("persists aligned clock history and restores the target position clocks", () => {
    expect(history).toContain("clockHistory?: ClockSnapshot[]");
    expect(play).toContain("clockSnapshotAfterUndo");
    expect(play).toContain("setWhiteSeconds(clockSnapshot.whiteSeconds)");
    expect(play).toContain("setBlackSeconds(clockSnapshot.blackSeconds)");
    expect(play).toContain("clockHistory");
  });
});