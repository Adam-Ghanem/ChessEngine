import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Play premium polish contract", () => {
  it("loads the production Play polish and preserves accessible controls", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./play-premium-polish.css", import.meta.url), "utf8");

    expect(main).toContain('import "./play-premium-polish.css"');
    expect(css).toMatch(/\.game-panel-actions button\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.play-analyze-link\s*\{[^}]*min-height:\s*44px/);
    expect(css).toContain("bottom:calc(76px + env(safe-area-inset-bottom))");
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
  });
});
