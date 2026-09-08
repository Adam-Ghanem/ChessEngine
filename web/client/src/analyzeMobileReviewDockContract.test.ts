import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analyze mobile Game Review dock contract", () => {
  it("keeps replay and review controls next to the board on small screens", () => {
    const analyze = readFileSync(new URL("./pages/Analyze.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./fen-analyze.css", import.meta.url), "utf8");

    expect(analyze).toContain('className="game-review-mobile-dock"');
    expect(analyze).toContain('aria-label="Mobile Game Review controls"');
    expect(analyze).toContain('onClick={() => selectReplayPosition(replayIndex - 1)}');
    expect(analyze).toContain('onClick={() => selectReplayPosition(replayIndex + 1)}');
    expect(analyze).toContain('onClick={reviewSelectedMove}');

    expect(styles).toContain(".game-review-mobile-dock { display: none;");
    expect(styles).toMatch(/@media \(max-width: 680px\)[\s\S]*\.game-review-mobile-dock \{ display: grid;/);
    expect(styles).toMatch(/\.game-review-mobile-dock \{[^}]*position: sticky;/);
    expect(styles).toMatch(/\.game-review-mobile-dock button \{[^}]*min-height: 44px;/);
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.game-review-mobile-dock \{[^}]*bottom: calc\(84px \+ env\(safe-area-inset-bottom\)\);/);
  });
});
