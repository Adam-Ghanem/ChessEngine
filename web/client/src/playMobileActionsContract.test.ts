import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play mobile action dock contract", () => {
  it("keeps primary game actions next to the board on small screens", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./play.css", import.meta.url), "utf8");
    const difficultyStyles = readFileSync(new URL("./play-difficulty.css", import.meta.url), "utf8");
    const mobileNavStyles = readFileSync(new URL("./play-mobile-nav-clearance.css", import.meta.url), "utf8");

    expect(play).toContain('className="play-mobile-actions"');
    expect(play).toContain('aria-label="Mobile game actions"');
    expect(play).toContain('onClick={undoMove}');
    expect(play).toContain('onClick={() => requestGameReset()}');
    expect(play).toContain('onClick={resignGame}');
    expect(play).toContain('href={analysisHrefForGame(fen, gameId)}');

    expect(styles).toContain(".play-mobile-actions{display:none}");
    expect(styles).toMatch(/@media\(max-width:640px\)[\s\S]*\.play-mobile-actions\{display:grid/);
    expect(styles).toMatch(/\.play-mobile-actions\{[^}]*position:sticky/);
    expect(difficultyStyles).toContain('@import "./play-mobile-nav-clearance.css";');
    expect(mobileNavStyles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.play-mobile-actions\s*\{[^}]*bottom: calc\(84px \+ env\(safe-area-inset-bottom\)\);/);
    expect(styles).toMatch(/\.play-mobile-actions (?:button|a)[^{]*\{[^}]*min-height:44px/);
  });
});
