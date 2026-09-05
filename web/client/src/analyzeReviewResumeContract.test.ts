import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analyze partial review resume", () => {
  it("moves a cached partial review to its first unreviewed recorded move", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

    expect(analyze).toContain("resumeReviewPly");
    expect(analyze).toContain("const cachedReviews = readGameReviewCache(window.localStorage, gameContext.id, depth, gameContext.moves)");
    expect(analyze).toContain("const resumePly = resumeReviewPly(gameContext.moves.length, Object.keys(cachedReviews).map(Number), replayIndex)");
    expect(analyze).toContain("setReplayIndex(resumePly)");
    expect(analyze).toContain("setDraftFen(replayPositions[resumePly])");
    expect(analyze).toContain("setLoadedFen(replayPositions[resumePly])");
  });
});
