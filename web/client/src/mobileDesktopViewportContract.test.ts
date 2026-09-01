import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile desktop-site viewport contract", () => {
  it("loads the overflow guard after the other production styles", () => {
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const brandImport = entry.indexOf('import "./brand.css"');
    const guardImport = entry.indexOf('import "./mobile-desktop-site.css"');

    expect(brandImport).toBeGreaterThan(-1);
    expect(guardImport).toBeGreaterThan(brandImport);
  });

  it("keeps the ChessIQ shell compact and overflow-safe through the shared 1030px breakpoint", () => {
    const css = readFileSync(new URL("./mobile-desktop-site.css", import.meta.url), "utf8");

    expect(css).toContain("@media (max-width: 1030px)");
    expect(css).toMatch(/\.brand-wordmark\s*\{[^}]*display:\s*none/s);
    expect(css).toMatch(/\.product-header \.app-nav\s*\{[^}]*min-width:\s*0/s);
    expect(css).toMatch(/\.analysis-product-shell\s*\{[^}]*width:\s*100%/s);
    expect(css).toMatch(/\.play-hero\s*>\s*div[\s\S]*?min-width:\s*0/s);
    expect(css).toMatch(/\.play-hero h1\s*\{[^}]*overflow-wrap:\s*anywhere/s);
    expect(css).toMatch(/\.play-status\s*\{[^}]*min-width:\s*0/s);
  });
});
