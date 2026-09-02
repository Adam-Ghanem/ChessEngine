import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ mobile premium navigation", () => {
  it("keeps desktop navigation while exposing a dedicated mobile bottom dock", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./mobile-navigation.css", import.meta.url), "utf8");

    expect(header).toContain('aria-label="Mobile navigation"');
    expect(header).toContain("mobile-bottom-nav");
    expect(header).toContain("mobile-more-button");
    expect(main).toContain('import "./mobile-navigation.css"');
    expect(existsSync(new URL("./mobile-navigation.css", import.meta.url))).toBe(true);
    expect(css).toContain("env(safe-area-inset-bottom)");
    expect(css).toContain(".mobile-bottom-nav");
    expect(css).toContain("@media (max-width: 640px)");
  });

  it("gives Play, Puzzles and Analyze first-class mobile destinations", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain('const mobilePrimaryRoutes: ProductPath[] = ["/", "/play", "/puzzles", "/analyze"]');
    expect(header).toContain('aria-current={isActive ? "page" : undefined}');
    expect(header).toContain('const mobileMoreRoutes: ProductPath[] = ["/learn", "/games", "/coach", "/progress"]');
  });
});
