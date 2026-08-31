import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production live ChessEngine analysis", () => {
  it("calls the production analysis function from the visible Analyze action", () => {
    const home = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
    expect(home).toContain('fetch("/api/analyze"');
    expect(home).toContain("setEngineAnalysis");
    expect(home).not.toContain("ChessIQ is calculating this position.");
  });

  it("renders real engine output when a live result is available", () => {
    const panel = readFileSync(new URL("./components/AnalysisPanel.tsx", import.meta.url), "utf8");
    expect(panel).toContain("liveAnalysis");
    expect(panel).toContain("Live analysis from");
    expect(panel).not.toContain("Live FEN analysis will replace this source");
  });
});
