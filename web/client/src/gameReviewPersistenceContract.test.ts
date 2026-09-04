import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("saved-game review persistence contract", () => {
  it("restores and writes depth-scoped review results in Analyze", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

    expect(analyze).toContain('from "@/lib/gameReviewCache"');
    expect(analyze).toContain("readGameReviewCache(window.localStorage");
    expect(analyze).toContain("writeGameReviewCache(window.localStorage");
    expect(analyze).toContain("gameContext.id, depth, gameContext.moves");
  });
});
