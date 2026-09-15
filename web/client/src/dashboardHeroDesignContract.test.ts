import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Dashboard premium hero design contract", () => {
  it("presents Play and Analyze as a responsive premium action cluster", () => {
    const dashboard = readFileSync(new URL("./pages/Dashboard.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./premium-shell.css", import.meta.url), "utf8");

    expect(dashboard).toContain('className="premium-hero-actions"');
    expect(dashboard).toContain('className="premium-hero-secondary"');
    expect(dashboard).toContain('className="premium-hero-proof"');

    expect(css).toMatch(/\.premium-hero-actions\s*\{[^}]*display:\s*flex[^}]*gap:/s);
    expect(css).toMatch(/\.premium-hero-secondary\s*\{[^}]*min-height:\s*44px[^}]*border:/s);
    expect(css).toMatch(/\.premium-hero-proof\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*?\.premium-hero-actions\s*\{[^}]*display:\s*grid/s);
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*?\.premium-hero-secondary\s*\{[^}]*width:\s*100%/s);
  });
});
