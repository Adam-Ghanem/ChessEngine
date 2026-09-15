import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Puzzles premium training polish", () => {
  it("loads the production polish layer and keeps responsive accessible training controls", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./puzzles-premium-polish.css", import.meta.url), "utf8");

    expect(main).toContain('import "./puzzles-premium-polish.css"');
    expect(css).toContain(".puzzles-product-shell .puzzles-hero");
    expect(css).toContain(".puzzles-product-shell .puzzle-queue { position: sticky");
    expect(css).toMatch(/\.puzzle-queue-list button,[\s\S]*\.puzzle-reset,[\s\S]*\.puzzle-next-row \.lesson-secondary,[\s\S]*\.puzzle-next-row \.lesson-primary \{ min-height: 44px;/);
    expect(css).toContain("bottom: calc(84px + env(safe-area-inset-bottom))");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
