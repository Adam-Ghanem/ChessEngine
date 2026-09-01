import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ brand mark", () => {
  it("uses the approved supplied knight-and-Q emblem in the frontend", () => {
    const component = readFileSync(new URL("./components/BrandMark.tsx", import.meta.url), "utf8");
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./brand.css", import.meta.url), "utf8");

    expect(entry).toContain('import "./brand.css"');
    expect(component).toContain('src="/chessiq-approved-emblem.webp"');
    expect(component).toContain('className="brand-mark brand-logo-image"');
    expect(component).not.toContain('<svg className="brand-mark brand-logo-svg"');
    expect(component).toContain('<span className="brand-wordmark">Chess<span>IQ</span></span>');
    expect(css).toMatch(/\.brand-logo-image\s*\{/);
    expect(css).toMatch(/\.brand-logo-image\s*\{[^}]*object-fit:\s*contain/s);
  });
});
