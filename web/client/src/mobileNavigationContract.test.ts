import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ mobile premium navigation", () => {
  it("keeps desktop navigation while exposing a dedicated mobile bottom dock", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./premium-shell.css", import.meta.url), "utf8");

    expect(header).toContain('aria-label="Mobile navigation"');
    expect(header).toContain("mobile-bottom-nav");
    expect(header).toContain("mobile-more-button");
    expect(css).toContain("env(safe-area-inset-bottom)");
    expect(css).toContain(".mobile-bottom-nav");
    expect(css).toContain("@media (max-width: 640px)");
  });

  it("gives Play, Puzzles and Analyze first-class mobile destinations", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain('href="/play"');
    expect(header).toContain('href="/puzzles"');
    expect(header).toContain('href="/analyze"');
    expect(header).toContain('aria-current={activePath === "/play" ? "page" : undefined}');
  });
});
