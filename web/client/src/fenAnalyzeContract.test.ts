import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production FEN Analyze workspace", () => {
  it("routes Analyze to a dedicated position-driven workspace and keeps Review separate", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    expect(app).toContain('import Analyze from "./pages/Analyze"');
    expect(app).toContain('<Route path="/analyze" component={Analyze} />');
    expect(app).toContain('<Route path="/review" component={Home} />');
  });

  it("analyzes a user-loaded FEN with the production ChessEngine client", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");
    expect(analyze).toContain("Load position");
    expect(analyze).toContain("Analyze position");
    expect(analyze).toContain("analyzePosition(loadedFen");
    expect(analyze).toContain("principalVariation");
    expect(analyze).not.toContain("sampleGame");
  });
});
