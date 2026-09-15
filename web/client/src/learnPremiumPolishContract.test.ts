import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Learn premium workspace polish", () => {
  it("loads the production polish layer and keeps responsive accessible lesson controls", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./learn-premium-polish.css", import.meta.url), "utf8");

    expect(main).toContain('import "./learn-premium-polish.css"');
    expect(css).toContain(".learn-product-shell .learn-hero");
    expect(css).toContain(".learn-product-shell .lesson-workspace { position: sticky");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("bottom: calc(84px + env(safe-area-inset-bottom))");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain(":focus-visible");
  });
});
