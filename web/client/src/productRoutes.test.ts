import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productRoutes";

describe("ChessIQ public product routing", () => {
  it("exposes six real product destinations including Games", () => {
    expect(productRoutes).toEqual([
      { href: "/play", label: "Play" },
      { href: "/games", label: "Games" },
      { href: "/analyze", label: "Analyze" },
      { href: "/learn", label: "Learn" },
      { href: "/puzzles", label: "Puzzles" },
      { href: "/progress", label: "Progress" },
    ]);
  });

  it("keeps preview-only navigation copy out of product pages", () => {
    const files = ["pages/Analyze.tsx", "pages/Play.tsx", "pages/Games.tsx", "pages/Learn.tsx", "pages/Puzzles.tsx", "pages/Progress.tsx"];
    for (const file of files) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/coming next|next production surface|aria-disabled=\"true\">Play/);
      expect(source).toContain("ProductHeader");
    }
  });

  it("aliases review to Analyze, makes Play the root route, and exposes Games and Progress", () => {
    const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    expect(source).toContain('<Route path="/" component={Play} />');
    expect(source).toContain('<Route path="/review" component={Analyze} />');
    expect(source).toContain('<Route path="/games" component={Games} />');
    expect(source).toContain('<Route path="/progress" component={Progress} />');
  });
});
