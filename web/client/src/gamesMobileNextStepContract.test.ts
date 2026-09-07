import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Games mobile next-step contract", () => {
  it("keeps the latest saved game's primary action within thumb reach", () => {
    const games = readFileSync(new URL("./pages/Games.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./games.css", import.meta.url), "utf8");

    expect(games).toContain('className="games-mobile-next-step"');
    expect(games).toContain('aria-label="Mobile games next action"');
    expect(games).toContain('const latestGame = games[0] ?? null;');
    expect(games).toContain('isResumableGame(latestGame)');
    expect(games).toContain('href={latestGamePrimaryHref}');
    expect(games).toContain('{latestGamePrimaryLabel}');
    expect(games.indexOf('className="games-mobile-next-step"')).toBeLessThan(games.indexOf('className="games-grid"'));

    expect(styles).toMatch(/\.games-mobile-next-step\s*\{[^}]*display:\s*none;?[^}]*\}/);
    expect(styles).toMatch(/@media\(max-width:700px\)[\s\S]*\.games-mobile-next-step\s*\{[^}]*display:\s*grid;/);
    expect(styles).toMatch(/@media\(max-width:700px\)[\s\S]*\.games-mobile-next-step\s*\{[^}]*position:\s*sticky;/);
    expect(styles).toMatch(/\.games-mobile-next-step \.primary-action\s*\{[^}]*min-height:\s*44px;/);
  });
});
