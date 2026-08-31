import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productRoutes";

describe("ChessIQ public product routing", () => {
  it("exposes four real product destinations", () => {
    expect(productRoutes).toEqual([
      { href: "/play", label: "Play" },
      { href: "/analyze", label: "Analyze" },
      { href: "/learn", label: "Learn" },
      { href: "/puzzles", label: "Puzzles" },
    ]);
  });

  it("keeps preview-only navigation copy out of product pages", () => {
    const files = ["pages/Analyze.tsx", "pages/Play.tsx", "pages/Learn.tsx", "pages/Puzzles.tsx"];
    for (const file of files) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/coming next|next production surface|aria-disabled=\"true\">Play/);
      expect(source).toContain("ProductHeader");
    }
  });

  it("aliases review to Analyze and makes Play the root product route", () => {
    const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    expect(source).toContain('<Route path="/" component={Play} />');
    expect(source).toContain('<Route path="/review" component={Analyze} />');
  });
});
