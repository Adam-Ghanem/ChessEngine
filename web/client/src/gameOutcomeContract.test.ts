import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("saved game outcome presentation", () => {
  it("uses one shared outcome formatter in Games and Analyze", () => {
    const games = source("./pages/Games.tsx");
    const analyze = source("./pages/Analyze.tsx");

    expect(games).toContain('import { gameOutcomeLabel } from "@/lib/gameOutcome";');
    expect(analyze).toContain('import { gameOutcomeLabel } from "@/lib/gameOutcome";');
    expect(games).toContain("gameOutcomeLabel(game)");
    expect(analyze).toContain("gameOutcomeLabel(gameContext)");
  });
});
