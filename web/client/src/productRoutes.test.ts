import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productRoutes";

describe("ChessIQ public product routing", () => {
  it("exposes eight real product destinations including Home, Games, and Coach", () => {
    expect(productRoutes).toEqual([
      { href: "/", label: "Home" },
      { href: "/play", label: "Play" },
      { href: "/puzzles", label: "Puzzles" },
      { href: "/learn", label: "Learn" },
      { href: "/games", label: "Games" },
      { href: "/analyze", label: "Analyze" },
      { href: "/coach", label: "Coach" },
      { href: "/progress", label: "Progress" },
    ]);
  });

  it("keeps preview-only navigation copy out of product pages", () => {
    const files = ["pages/Dashboard.tsx", "pages/Analyze.tsx", "pages/Play.tsx", "pages/Games.tsx", "pages/Learn.tsx", "pages/Puzzles.tsx", "pages/Progress.tsx", "pages/Coach.tsx"];
    for (const file of files) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/coming next|next production surface|aria-disabled=\"true\">Play/);
      expect(source).toContain("ProductHeader");
    }
  });

  it("aliases review to Analyze, makes Dashboard the root route, and keeps Play directly addressable", () => {
    const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    expect(source).toContain('<Route path="/" component={Dashboard} />');
    expect(source).toContain('<Route path="/play" component={Play} />');
    expect(source).toContain('<Route path="/review" component={Analyze} />');
    expect(source).toContain('<Route path="/games" component={Games} />');
    expect(source).toContain('<Route path="/progress" component={Progress} />');
    expect(source).toContain('<Route path="/coach" component={Coach} />');
  });
});
