import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Openings empty-state recovery accessibility", () => {
  it("keeps the clear-search recovery action at an accessible touch-target height", () => {
    const css = readFileSync(new URL("./openings.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.openings-empty button\s*\{[^}]*min-height:\s*44px;/s);
  });
});
