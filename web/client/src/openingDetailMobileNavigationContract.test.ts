import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Opening detail mobile navigation contract", () => {
  it("keeps replay controls above the fixed ChessIQ navigation on small screens", () => {
    const detail = readFileSync(new URL("./pages/OpeningDetail.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./opening-detail.css", import.meta.url), "utf8");

    expect(detail).toContain('className="opening-mobile-navigation-dock"');
    expect(detail).toContain('aria-label="Mobile opening move navigation"');
    expect(detail).toContain('onClick={previousMove}');
    expect(detail).toContain('onClick={nextMove}');

    expect(styles).toContain(".opening-mobile-navigation-dock { display: none;");
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.opening-mobile-navigation-dock \{ display: grid;/);
    expect(styles).toMatch(/\.opening-mobile-navigation-dock \{[^}]*position: sticky;[^}]*bottom: calc\(84px \+ env\(safe-area-inset-bottom\)\);/);
    expect(styles).toMatch(/\.opening-mobile-navigation-dock button \{[^}]*min-height: 44px;/);
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.opening-board-controls \{ display: none;/);
  });
});
