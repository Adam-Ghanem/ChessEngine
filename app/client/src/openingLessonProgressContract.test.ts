import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(relative: string) {
  try { return readFileSync(new URL(relative, import.meta.url), "utf8"); } catch { return ""; }
}

describe("opening course learning progress", () => {
  const page = source("./pages/ProgressPage.tsx");
  const section = source("./components/learning/OpeningCourseProgressSection.tsx");

  it("keeps opening course study separate from trainer mastery", () => {
    expect(page).toContain('OpeningCourseProgressSection');
    expect(page).toContain('OpeningProgressSection');
    expect(section).toContain('Opening courses');
    expect(section.toLowerCase()).toContain('repertoire mastery');
  });

  it("counts only catalog items that are opening courses", () => {
    expect(section).toContain('lesson.kind === "opening"');
    expect(section).toContain('In progress');
    expect(section).toContain('Completed');
    expect(section).toContain('completedSteps');
  });

  it("offers a direct Continue learning action without claiming mastery", () => {
    expect(section).toContain('Continue learning');
    expect(section).toContain('/learn/openings/${nextLesson.slug}');
    expect(section).toContain('Course completion tracks study progress');
  });
});
