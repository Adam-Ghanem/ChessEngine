import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Games persisted review progress", () => {
  it("surfaces cached review completion and offers a continue-review handoff", () => {
    const games = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");

    expect(games).toContain('from "@/lib/gameReviewCache"');
    expect(games).toContain("readGameReviewProgress(window.localStorage, game.id, game.moves)");
    expect(games).toContain("game-review-progress");
    expect(games).toContain("Continue review");
  });

  it("cleans persisted review cache when saved games are deleted", () => {
    const games = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");

    expect(games).toContain("clearGameReviewCache(window.localStorage, game.id)");
    expect(games).toContain("games.forEach(game => clearGameReviewCache(window.localStorage, game.id))");
  });
});
