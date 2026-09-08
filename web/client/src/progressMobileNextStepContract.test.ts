import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Progress mobile next-step contract", () => {
  it("keeps the evidence-backed next action within thumb reach wherever mobile navigation is active", () => {
    const progress = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./progress.css", import.meta.url), "utf8");
    const mobileNavStyles = readFileSync(new URL("./progress-mobile-nav.css", import.meta.url), "utf8");
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(progress).toContain('className="progress-mobile-next-step"');
    expect(progress).toContain('aria-label="Mobile progress next step"');
    expect(progress).toContain('href={nextStep.href}');
    expect(progress).toContain('{nextStep.label}');
    expect(progress).toContain('progress-desktop-primary');

    expect(styles).toContain(".progress-mobile-next-step {");
    expect(styles).toMatch(/\.progress-mobile-next-step \{[^}]*display: none;/);
    expect(styles).toMatch(/\.progress-mobile-next-step \.primary-action \{[^}]*min-height: 44px;/);

    expect(main).toContain('import "./progress-mobile-nav.css"');
    expect(mobileNavStyles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.progress-mobile-next-step \{[^}]*display: grid;/);
    expect(mobileNavStyles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.progress-mobile-next-step \{[^}]*position: sticky;/);
    expect(mobileNavStyles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.progress-desktop-primary \{[^}]*display: none;/);
  });
});
