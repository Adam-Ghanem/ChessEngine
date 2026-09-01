import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ brand mark", () => {
  it("uses the approved minimal knight-and-Q logo with a ChessIQ wordmark", () => {
    const component = readFileSync(new URL("./components/BrandMark.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./index.css", import.meta.url), "utf8");

    expect(component).toContain('className="brand-mark brand-logo-svg"');
    expect(component).toContain('className="brand-logo-knight"');
    expect(component).toContain('className="brand-logo-q"');
    expect(component).toContain('<span className="brand-wordmark">Chess<span>IQ</span></span>');
    expect(css).toContain("--iq-logo-blue:");
    expect(css).toMatch(/\.brand-logo-svg\s*\{/);
    expect(css).toMatch(/\.brand-logo-q\s*\{[^}]*stroke:\s*var\(--iq-logo-blue\)/s);
  });
});
