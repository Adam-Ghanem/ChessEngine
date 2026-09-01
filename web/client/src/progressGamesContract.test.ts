import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const progressSource = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");

describe("ChessIQ Progress game evidence", () => {
  it("includes persisted Games activity in the Progress surface", () => {
    expect(progressSource).toContain('import { readGameHistory } from "@/lib/gameHistory"');
    expect(progressSource).toContain("savedGames");
    expect(progressSource).toContain("movesPlayed");
    expect(progressSource).toContain("Games played");
  });
});
