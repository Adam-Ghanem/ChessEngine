import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Puzzles mobile action dock contract", () => {
  it("keeps puzzle recovery and progression controls next to the board on small screens", () => {
    const puzzles = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(puzzles).toContain('className="puzzle-mobile-action-dock"');
    expect(puzzles).toContain('role="navigation"');
    expect(puzzles).toContain('aria-label="Mobile puzzle controls"');
    expect(puzzles).toContain('onClick={restartPuzzle}');
    expect(puzzles).toContain('onClick={openNextUnsolvedPuzzle}');

    expect(styles).toContain(".puzzle-mobile-action-dock { display: none;");
    expect(styles).toMatch(/@media \(max-width: 680px\)[\s\S]*\.puzzle-mobile-action-dock \{ display: grid;/);
    expect(styles).toMatch(/\.puzzle-mobile-action-dock \{[^}]*position: sticky;/);
    expect(styles).toMatch(/\.puzzle-mobile-action-dock (?:button|a) \{[^}]*min-height: 44px;/);
  });
});
