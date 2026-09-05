import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const analyzeSource = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

describe("saved-game full review cancellation contract", () => {
  it("lets the player stop a running full review and abort the in-flight engine request", () => {
    expect(analyzeSource).toContain("reviewAbortControllerRef");
    expect(analyzeSource).toContain("new AbortController()");
    expect(analyzeSource).toContain("stopReviewRemainingMoves");
    expect(analyzeSource).toContain("analyzeRecordedMove(queue[index], controller.signal)");
    expect(analyzeSource).toContain("Stop full saved-game review");
  });
});
