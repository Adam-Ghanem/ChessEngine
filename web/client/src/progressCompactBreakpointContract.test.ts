import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Progress compact breakpoint contract", () => {
  it("keeps the compact Progress layout aligned with the mobile navigation range", () => {
    const styles = readFileSync(new URL("./progress-mobile-nav.css", import.meta.url), "utf8");

    expect(styles).toMatch(/@media \(max-width: 640px\) \{[\s\S]*\.progress-grid \{[\s\S]*grid-template-columns: 1fr;/);
    expect(styles).toMatch(/\.progress-form,[\s\S]*\.progress-review-heading \{[\s\S]*flex-direction: column;/);
    expect(styles).toMatch(/\.progress-focus \{[\s\S]*flex-direction: column;/);
  });
});
