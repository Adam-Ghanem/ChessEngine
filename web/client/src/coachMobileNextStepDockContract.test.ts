import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Coach mobile next-step dock contract", () => {
  it("keeps the primary training action within thumb reach on small screens", () => {
    const coach = readFileSync(new URL("./pages/Coach.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./coach.css", import.meta.url), "utf8");

    expect(coach).toContain('className="coach-mobile-next-step"');
    expect(coach).toContain('aria-label="Recommended next training step"');
    expect(coach).toContain('href={primaryPlan.href}');
    expect(coach).toContain('{primaryPlan.action}');

    expect(styles).toMatch(/\.coach-mobile-next-step\s*\{[^}]*display:\s*none;/);
    expect(styles).toMatch(/@media \(max-width: 720px\)[\s\S]*\.coach-mobile-next-step\s*\{[^}]*display:\s*grid;/);
    expect(styles).toMatch(/\.coach-mobile-next-step\s*\{[^}]*position:\s*sticky;/);
    expect(styles).toMatch(/\.coach-mobile-next-step a\s*\{[^}]*min-height:\s*44px;/);
    expect(styles).toContain("bottom: calc(88px + env(safe-area-inset-bottom));");
  });
});
