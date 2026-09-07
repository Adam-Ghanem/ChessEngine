import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Dashboard mobile next-step contract", () => {
  it("keeps the verified next action within thumb reach on small screens", () => {
    const dashboard = readFileSync(new URL("./pages/Dashboard.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./premium-shell.css", import.meta.url), "utf8");

    expect(dashboard).toContain('className="dashboard-mobile-next-step"');
    expect(dashboard).toContain('aria-label="Mobile dashboard next action"');
    expect(dashboard).toContain('href={nextAction.href}');
    expect(dashboard).toContain('{nextAction.label}');
    expect(dashboard).toContain('premium-next-panel desktop-dashboard-next-step');

    expect(styles).toMatch(/\.dashboard-mobile-next-step\s*\{[^}]*display:\s*none;/);
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.dashboard-mobile-next-step\s*\{[^}]*display:\s*grid;/);
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.dashboard-mobile-next-step\s*\{[^}]*position:\s*sticky;/);
    expect(styles).toMatch(/\.dashboard-mobile-next-step \.premium-secondary-action\s*\{[^}]*min-height:\s*44px;/);
    expect(styles).toMatch(/@media \(max-width: 640px\)[\s\S]*\.desktop-dashboard-next-step\s*\{[^}]*display:\s*none;/);
  });
});
