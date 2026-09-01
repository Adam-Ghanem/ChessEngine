import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production mobile product layout", () => {
  it("keeps the global production shell readable in desktop-like mobile viewports", () => {
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./production-mobile.css", import.meta.url), "utf8");

    expect(entry).toContain('import "./production-mobile.css"');
    expect(css).toContain("@media (max-width: 1030px)");
    expect(css).toMatch(/\.app-header\s*\{[^}]*flex-wrap:\s*wrap/s);
    expect(css).toMatch(/\.app-nav\s*\{[^}]*order:\s*3[^}]*overflow-x:\s*auto/s);
  });

  it("makes Play single-column at the same 1030px production breakpoint", () => {
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");
    expect(css).toContain("@media(max-width:1030px)");
    expect(css).toMatch(/@media\(max-width:1030px\).*?\.play-layout\{grid-template-columns:1fr\}/s);
    expect(css).toMatch(/@media\(max-width:1030px\).*?\.play-rail\{position:static/s);
  });

  it("gives the Play board a square full-bleed mobile presentation", () => {
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.play-board\{[^}]*aspect-ratio:1[^}]*grid-template-columns:repeat\(8,minmax\(0,1fr\)\)[^}]*grid-template-rows:repeat\(8,minmax\(0,1fr\)\)/s);
    expect(css).toMatch(/@media\(max-width:640px\).*?\.play-board-card\{[^}]*width:100dvw[^}]*margin-inline:calc\(50% - 50dvw\)[^}]*padding:0[^}]*border:0/s);
    expect(css).toMatch(/@media\(max-width:640px\).*?\.play-board\{[^}]*width:100%[^}]*max-width:none[^}]*border-radius:0[^}]*border:0/s);
    expect(css).toMatch(/\.play-square\.is-light\s+\.rank-label,\.play-square\.is-light\s+\.file-label\{[^}]*color:/s);
    expect(css).toMatch(/\.play-square\.is-dark\s+\.rank-label,\.play-square\.is-dark\s+\.file-label\{[^}]*color:/s);
  });

  it("makes Analyze single-column at the 1030px production breakpoint", () => {
    const css = readFileSync(new URL("./fen-analyze.css", import.meta.url), "utf8");
    expect(css).toContain("@media (max-width: 1030px)");
    expect(css).toMatch(/@media \(max-width: 1030px\).*?\.fen-analyze-layout\s*\{\s*grid-template-columns:\s*1fr/s);
  });

  it("makes Learn and Puzzles single-column at the 1030px production breakpoint", () => {
    const css = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");
    expect(css).toContain("@media (max-width: 1030px)");
    expect(css).toMatch(/@media \(max-width: 1030px\).*?\.learn-layout\s*\{\s*grid-template-columns:\s*1fr/s);
    expect(css).toMatch(/@media \(max-width: 1030px\).*?\.puzzles-layout\s*\{\s*grid-template-columns:\s*1fr/s);
  });
});
