import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("puzzle progress reset accessibility", () => {
  it("keeps the saved-progress reset action at an accessible touch-target height", () => {
    const css = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.puzzle-reset\s*\{[^}]*min-height:\s*44px/s);
  });
});
