import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Progress compact breakpoint contract", () => {
  it("keeps the compact Progress layout aligned with the mobile navigation range", () => {
    const styles = readFileSync(new URL("./progress.css", import.meta.url), "utf8");

    expect(styles).toMatch(/@media \(max-width: 640px\) \{[\s\S]*\.progress-grid \{[\s\S]*grid-template-columns: 1fr;/);
    expect(styles).not.toContain("@media (max-width: 620px)");
  });
});
