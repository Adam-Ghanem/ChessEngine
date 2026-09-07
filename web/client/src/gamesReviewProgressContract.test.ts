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

  it("exposes cached Game Review completion as semantic progress", () => {
    const games = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");

    expect(games).toContain('role="progressbar"');
    expect(games).toContain("aria-valuemin={0}");
    expect(games).toContain("aria-valuemax={reviewProgress.total}");
    expect(games).toContain("aria-valuenow={reviewProgress.reviewed}");
    expect(games).toContain("aria-valuetext={`${reviewProgress.reviewed} of ${reviewProgress.total} plies reviewed at depth ${reviewProgress.depth}`}");
  });

  it("cleans persisted review cache when saved games are deleted", () => {
    const games = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");

    expect(games).toContain("clearGameReviewCache(window.localStorage, game.id)");
    expect(games).toContain("games.forEach(game => clearGameReviewCache(window.localStorage, game.id))");
  });
});
