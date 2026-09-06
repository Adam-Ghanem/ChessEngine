import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gamesPage = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");

describe("Games destructive actions", () => {
  it("requires confirmation before clearing every saved game and review", () => {
    const clearHistoryStart = gamesPage.indexOf("function clearHistory()");
    const clearHistoryEnd = gamesPage.indexOf("\n  return (", clearHistoryStart);
    const clearHistoryBody = gamesPage.slice(clearHistoryStart, clearHistoryEnd);

    const confirmationIndex = clearHistoryBody.indexOf("window.confirm");
    const clearReviewsIndex = clearHistoryBody.indexOf("games.forEach");
    const clearGamesIndex = clearHistoryBody.indexOf("clearGameHistory()");

    expect(confirmationIndex).toBeGreaterThanOrEqual(0);
    expect(clearReviewsIndex).toBeGreaterThan(confirmationIndex);
    expect(clearGamesIndex).toBeGreaterThan(confirmationIndex);
    expect(clearHistoryBody).toContain("This cannot be undone");
  });
});
