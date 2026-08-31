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
