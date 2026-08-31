import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ production analysis redesign", () => {
  it("uses the new product shell and removes demo-only production copy", () => {
    const home = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(entry).toContain('import "./production-redesign.css"');
    expect(home).toContain('className="analysis-product-shell"');
    expect(home).toContain('className="analysis-hero"');
    expect(home).toContain('className="analysis-board-card"');
    expect(home).toContain('className="analysis-side-stack"');
    expect(home).not.toContain("Local development sample");
    expect(home).not.toContain("Engine bridge pending");
    expect(home).not.toContain("prepared for the next product increment");
  });

  it("defines a board-first responsive production layout", () => {
    const css = readFileSync(new URL("./production-redesign.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.analysis-product-shell\s*\{/);
    expect(css).toMatch(/\.analysis-layout\s*\{[^}]*grid-template-columns:/s);
    expect(css).toContain("@media (max-width: 900px)");
    expect(css).toMatch(/\.analysis-layout\s*\{[^}]*grid-template-columns:\s*1fr/s);
    expect(css).toMatch(/\.analysis-board-card\s*\{[^}]*order:\s*1/s);
  });
});
