import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile desktop-site viewport contract", () => {
  it("keeps the ChessIQ shell compact and overflow-safe through the shared 1030px breakpoint", () => {
    const mobile = readFileSync(new URL("./production-mobile.css", import.meta.url), "utf8");
    const redesign = readFileSync(new URL("./production-redesign.css", import.meta.url), "utf8");
    const play = readFileSync(new URL("./play.css", import.meta.url), "utf8");
    const brand = readFileSync(new URL("./brand.css", import.meta.url), "utf8");

    expect(brand).toMatch(/@media\s*\(max-width:\s*1030px\)[\s\S]*?\.brand-wordmark\s*\{[^}]*display:\s*none/s);
    expect(mobile).toMatch(/@media\s*\(max-width:\s*1030px\)[\s\S]*?\.app-nav\s*\{[^}]*min-width:\s*0/s);
    expect(redesign).toMatch(/@media\s*\(max-width:\s*1030px\)[\s\S]*?\.analysis-product-shell\s*\{[^}]*min-width:\s*0/s);
    expect(play).toMatch(/@media\s*\(max-width:\s*1030px\)[\s\S]*?\.play-hero\s*>\s*div\s*\{[^}]*min-width:\s*0/s);
    expect(play).toMatch(/@media\s*\(max-width:\s*1030px\)[\s\S]*?\.play-hero\s+h1\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  });
});
