import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./productNavigation";

describe("productRoutes", () => {
  it("keeps the ChessIQ primary navigation in product order", () => {
    expect(productRoutes).toEqual([
      { href: "/play", label: "Play" },
      { href: "/analyze", label: "Analyze" },
      { href: "/puzzles", label: "Puzzles" },
      { href: "/learn", label: "Learn" },
      { href: "/games", label: "Games" },
      { href: "/progress", label: "Progress" },
      { href: "/coach", label: "Coach" },
    ]);
  });

  it("keeps product navigation reachable on mobile", () => {
    const source = readFileSync(new URL("../components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(source).toContain('className="mobile-product-nav"');
    expect(source).toContain('aria-label="Mobile ChessIQ product navigation"');
  });
});

describe("Play workspace", () => {
  it("keeps the board as the primary product surface", () => {
    const source = readFileSync(new URL("../pages/PlayPage.tsx", import.meta.url), "utf8");

    expect(source).not.toContain("Play a legal game. Keep every position.");
    expect(source).toContain('className="play-cockpit"');
    expect(source).toContain("New game");
    expect(source).toContain("Recent games");
  });
});

describe("Analyze workspace", () => {
  it("presents real ChessEngine analysis as the flagship workflow", () => {
    const source = readFileSync(new URL("../pages/AnalyzePage.tsx", import.meta.url), "utf8");

    expect(source).not.toContain("Ask the engine about a real saved position.");
    expect(source).toContain('className="analysis-cockpit"');
    expect(source).toContain("Engine analysis");
    expect(source).toContain("Import PGN");
    expect(source).toContain("Your games");
  });
});
