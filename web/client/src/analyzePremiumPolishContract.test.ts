import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Analyze premium workspace polish", () => {
  it("loads the production polish layer and preserves accessible responsive controls", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./analyze-premium-polish.css", import.meta.url), "utf8");

    expect(main).toContain('import "./analyze-premium-polish.css"');
    expect(css).toContain(".analysis-product-shell .analysis-hero");
    expect(css).toContain(".analysis-product-shell .fen-analyze-rail { position: sticky");
    expect(css).toMatch(/\.fen-secondary-action,[\s\S]*\.fen-review-link,[\s\S]*\.game-review-replay button \{ min-height: 44px;/);
    expect(css).toContain("@media (max-width: 680px)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
