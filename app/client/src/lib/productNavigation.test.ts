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
