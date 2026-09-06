import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ Game Review progress accessibility", () => {
  it("exposes full-game review progress as an accessible live progress indicator", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");

    expect(analyze).toContain('role="progressbar"');
    expect(analyze).toContain('aria-label="Saved game review progress"');
    expect(analyze).toContain("aria-valuemin={0}");
    expect(analyze).toContain("aria-valuemax={reviewAllProgress.total}");
    expect(analyze).toContain("aria-valuenow={reviewAllProgress.completed}");
    expect(analyze).toContain('aria-live="polite"');
    expect(analyze).toContain('aria-atomic="true"');
  });
});
