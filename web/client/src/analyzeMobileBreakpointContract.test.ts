import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analyze production mobile breakpoint contract", () => {
  it("applies the compact Analyze layout across the full mobile navigation range", () => {
    const styles = readFileSync(new URL("./production-redesign.css", import.meta.url), "utf8");

    expect(styles).toMatch(/@media \(max-width: 640px\) \{[\s\S]*\.analysis-product-shell \{[\s\S]*padding: 0 10px 24px;/);
    expect(styles).not.toContain("@media (max-width: 620px)");
  });
});
