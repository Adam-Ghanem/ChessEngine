import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile training dock clearance contract", () => {
  it("keeps Learn and Puzzles docks above the fixed phone nav without wasting tablet space", () => {
    const styles = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(styles).toMatch(/\.learn-mobile-action-dock \{[^}]*bottom: 12px;/);
    expect(styles).toMatch(/\.puzzle-mobile-action-dock \{[^}]*bottom: 12px;/);
    expect(styles).toMatch(
      /@media \(max-width: 640px\)[\s\S]*\.learn-mobile-action-dock \{[^}]*bottom: calc\(84px \+ env\(safe-area-inset-bottom, 0px\)\);/,
    );
    expect(styles).toMatch(
      /@media \(max-width: 640px\)[\s\S]*\.puzzle-mobile-action-dock \{[^}]*bottom: calc\(84px \+ env\(safe-area-inset-bottom, 0px\)\);/,
    );
  });
});
