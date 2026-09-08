import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile training dock clearance contract", () => {
  it("keeps Learn and Puzzles docks above the fixed phone nav without wasting tablet space", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./mobile-training-docks.css", import.meta.url), "utf8");

    expect(header).toContain('import "../mobile-training-docks.css";');
    expect(styles).toMatch(/@media \(min-width: 641px\) and \(max-width: 680px\)[\s\S]*bottom: 12px;/);
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*bottom: calc\(84px \+ env\(safe-area-inset-bottom, 0px\)\);/);
    expect(styles).toContain(".learn-mobile-action-dock");
    expect(styles).toContain(".puzzle-mobile-action-dock");
  });
});
