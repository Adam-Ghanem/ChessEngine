import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analyze engine status accessibility", () => {
  it("announces engine state changes without interrupting the user", () => {
    const panel = readFileSync(new URL("./components/AnalysisPanel.tsx", import.meta.url), "utf8");

    // Keep the existing visual status as one polite, atomic announcement.
    expect(panel).toContain('className="analysis-status" role="status" aria-live="polite" aria-atomic="true"');
  });
});
