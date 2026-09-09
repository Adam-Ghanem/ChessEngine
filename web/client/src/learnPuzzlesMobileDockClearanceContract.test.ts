import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Learn and Puzzles mobile dock clearance contract", () => {
  it("keeps sticky actions above the production mobile navigation only while that navigation is present", () => {
    const styles = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    for (const selector of ["learn-mobile-action-dock", "puzzle-mobile-action-dock"]) {
      expect(styles).toMatch(new RegExp(`\\.${selector} \\{[^}]*bottom: 12px;`));
      expect(styles).toMatch(
        new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*\\.${selector} \\{[^}]*bottom: calc\\(84px \\+ env\\(safe-area-inset-bottom\\)\\);`),
      );
    }

    expect(styles).toMatch(/@media \(max-width: 680px\)[\s\S]*\.learn-mobile-action-dock \{ display: grid;/);
    expect(styles).toMatch(/@media \(max-width: 680px\)[\s\S]*\.puzzle-mobile-action-dock \{ display: grid;/);
  });
});
