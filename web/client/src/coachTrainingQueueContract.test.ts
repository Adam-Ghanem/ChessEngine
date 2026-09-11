import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const coach = readFileSync(new URL("./pages/Coach.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("./coach.css", import.meta.url), "utf8");

describe("Coach training queue", () => {
  it("ships a prioritized multi-step training queue from verified evidence", () => {
    expect(coach).toContain("buildTrainingQueue");
    expect(coach).toContain('aria-label="Training plan steps"');
    expect(coach).toContain("coach-plan-queue");
    expect(coach).toContain("Next");
    expect(coach).toContain("Then");
  });

  it("exposes the prioritized queue as an ordered list", () => {
    expect(coach).toContain('<ol className="coach-plan-queue" aria-label="Training plan steps">');
    expect(coach).toContain('<li className="coach-plan-step" key={step.href}>');
    expect(coach).not.toContain('<section className="coach-plan-queue" aria-label="Training plan steps">');
  });

  it("keeps the queue responsive and touch friendly", () => {
    expect(css).toContain(".coach-plan-queue");
    expect(css).toContain(".coach-plan-step");
    expect(css).toContain("@media (max-width: 720px)");
  });
});
