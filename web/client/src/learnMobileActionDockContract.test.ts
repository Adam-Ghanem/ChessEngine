import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Learn mobile action dock contract", () => {
  it("keeps checkpoint progression within thumb reach on small screens", () => {
    const learn = readFileSync(new URL("./pages/Learn.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(learn).toContain('className="learn-mobile-action-dock"');
    expect(learn).toContain('aria-label="Mobile lesson controls"');
    expect(learn).toContain('onClick={completeCheckpoint}');
    expect(learn).toContain('onClick={resetLesson}');
    expect(learn).toContain('onClick={() => setSelectedKey(nextLessonKey)}');

    expect(styles).toContain(".learn-mobile-action-dock { display: none;");
    expect(styles).toMatch(/\.learn-mobile-action-dock \{[^}]*position: sticky;/);
    expect(styles).toMatch(/\.learn-mobile-action-dock (?:button|a) \{[^}]*min-height: 44px;/);
    expect(styles).toMatch(/@media \(max-width: 680px\)[\s\S]*\.learn-mobile-action-dock \{ display: grid;/);
    expect(styles).toMatch(/@media \(max-width: 680px\)[\s\S]*\.learn-desktop-actions \{ display: none;/);
  });
});
