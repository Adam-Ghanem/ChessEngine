import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Games action accessibility", () => {
  it("gives repeated saved-game actions a contextual accessible name", () => {
    const games = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");

    expect(games).toContain("const gameActionContext = new Date(game.updatedAt).toLocaleString()");
    expect(games).toContain('aria-label={`Copy FEN for saved game from ${gameActionContext}`}');
    expect(games).toContain('aria-label={`Resume saved game from ${gameActionContext}`}');
    expect(games).toContain('aria-label={`${reviewAction} for saved game from ${gameActionContext}`}');
    expect(games).toContain('aria-label={`Delete saved game from ${gameActionContext}`}');
  });
});
