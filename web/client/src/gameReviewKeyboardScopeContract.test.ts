import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analyze Game Review keyboard scope", () => {
  it("keeps replay navigation shortcuts on the replay surface instead of hijacking focused child controls", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

    expect(analyze).toContain("if (event.target !== event.currentTarget) return");
    expect(analyze).toContain('if (event.key === "ArrowLeft") nextIndex = replayIndex - 1');
    expect(analyze).toContain('if (event.key === "ArrowRight") nextIndex = replayIndex + 1');
    expect(analyze).toContain('if (event.key === "Home") nextIndex = 0');
    expect(analyze).toContain('if (event.key === "End") nextIndex = replayPositions.length - 1');
  });
});
