import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production mobile analysis layout", () => {
  it("keeps the production workspace readable in compact viewports", () => {
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./production-mobile.css", import.meta.url), "utf8");

    expect(entry).toContain('import "./production-mobile.css"');
    expect(css).toContain("@media (max-width: 1030px)");
    expect(css).toMatch(/\.app-header\s*\{[^}]*flex-wrap:\s*wrap/s);
    expect(css).toMatch(/\.app-nav\s*\{[^}]*order:\s*3[^}]*overflow-x:\s*auto/s);
    expect(css).toMatch(/\.analysis-workbench\s*\{[^}]*grid-template-columns:\s*1fr[^}]*"primary"\s*"rail"\s*"graph"/s);
    expect(css).toMatch(/\.game-review-card\s*\{[^}]*position:\s*relative/s);
  });
});
