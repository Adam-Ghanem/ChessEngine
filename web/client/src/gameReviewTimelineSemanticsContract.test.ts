import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Game Review timeline semantics", () => {
  it("keeps timeline actions exposed as buttons inside named navigation regions", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

    expect(analyze).toContain('<nav className="game-review-move-timeline" aria-label="Highest centipawn-loss reviewed moves">');
    expect(analyze).toContain('<nav className="game-review-move-timeline" aria-label="Recorded move timeline">');
    expect(analyze).not.toContain('role="listitem"');
    expect(analyze).not.toContain('role="list" aria-label="Highest centipawn-loss reviewed moves"');
    expect(analyze).not.toContain('role="list" aria-label="Recorded move timeline"');
  });
});
