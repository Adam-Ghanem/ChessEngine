import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const analyzeSource = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

describe("saved-game full review UI contract", () => {
  it("offers a sequential review action for only the remaining recorded moves", () => {
    expect(analyzeSource).toContain("pendingReviewPlies");
    expect(analyzeSource).toContain("Review remaining moves");
    expect(analyzeSource).toContain("reviewAllProgress");
    expect(analyzeSource).toContain("aria-label=\"Review remaining saved-game moves\"");
  });
});
