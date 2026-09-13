import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile product navigation accessibility", () => {
  it("keeps global navigation items at an accessible touch-target height", () => {
    const css = readFileSync(new URL("./accessibility.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.app-nav \.nav-item\s*\{[^}]*min-height:\s*44px/s);
  });
});
