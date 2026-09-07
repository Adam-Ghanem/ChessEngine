import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Progress mobile next-step contract", () => {
  it("keeps the evidence-backed next action within thumb reach on small screens", () => {
    const progress = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./progress.css", import.meta.url), "utf8");

    expect(progress).toContain('className="progress-mobile-next-step"');
    expect(progress).toContain('aria-label="Mobile progress next step"');
    expect(progress).toContain('href={nextStep.href}');
    expect(progress).toContain('{nextStep.label}');
    expect(progress).toContain('progress-desktop-primary');

    expect(styles).toContain(".progress-mobile-next-step {");
    expect(styles).toMatch(/\.progress-mobile-next-step \{[^}]*display: none;/);
    expect(styles).toMatch(/@media \(max-width: 620px\)[\s\S]*\.progress-mobile-next-step \{[^}]*display: grid;/);
    expect(styles).toMatch(/@media \(max-width: 620px\)[\s\S]*\.progress-mobile-next-step \{[^}]*position: sticky;/);
    expect(styles).toMatch(/\.progress-mobile-next-step \.primary-action \{[^}]*min-height: 44px;/);
    expect(styles).toMatch(/@media \(max-width: 620px\)[\s\S]*\.progress-desktop-primary \{[^}]*display: none;/);
  });
});
