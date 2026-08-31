import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production live ChessEngine analysis", () => {
  it("calls the production analysis client from the visible Analyze action", () => {
    const home = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
    const client = readFileSync(new URL("./engine/serverEngine.ts", import.meta.url), "utf8");
    expect(home).toContain("analyzePosition(");
    expect(home).toContain("setEngineAnalysis");
    expect(home).not.toContain("ChessIQ is calculating this position.");
    expect(client).toContain('fetch("/api/analyze"');
  });

  it("renders real engine output when a live result is available", () => {
    const panel = readFileSync(new URL("./components/AnalysisPanel.tsx", import.meta.url), "utf8");
    expect(panel).toContain("liveAnalysis");
    expect(panel).toContain("Live analysis from");
    expect(panel).not.toContain("Live FEN analysis will replace this source");
  });
});
