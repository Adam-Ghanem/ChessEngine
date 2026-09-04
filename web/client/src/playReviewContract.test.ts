import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

describe("Play to Game Review handoff", () => {
  it("deep-links the current saved game into Analyze with its game id", () => {
    expect(play).toContain("analysisHrefForGame");
    expect(play).toContain("analysisHrefForGame(fen, gameId)");
    expect(play).toContain("Review game");
  });
});
