import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play game status accessibility", () => {
  it("announces game-state transitions as one polite atomic status", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

    expect(play).toContain('className="game-panel-status" role="status" aria-live="polite" aria-atomic="true"');
  });
});
