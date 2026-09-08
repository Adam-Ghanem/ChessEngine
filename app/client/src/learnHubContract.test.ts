import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ Learn opening course hub", () => {
  const page = readFileSync(new URL("./pages/LearnPage.tsx", import.meta.url), "utf8");

  it("promotes the 100-course opening library without hiding foundations", () => {
    expect(page).toContain("Opening Courses");
    expect(page).toContain("Foundation paths");
    expect(page).toContain('lesson.kind === "opening"');
    expect(page).toContain('lesson.kind === "foundation"');
  });

  it("uses a dedicated accessible search and filter surface", () => {
    expect(page).toContain('import { LessonFilters } from "@/components/learning/LessonFilters"');
    expect(page).toContain("<LessonFilters");
    const filters = readFileSync(new URL("./components/learning/LessonFilters.tsx", import.meta.url), "utf8");
    expect(filters).toContain('aria-label="Search opening courses"');
    expect(filters).toContain("family");
    expect(filters).toContain("sideFocus");
    expect(filters).toContain("difficulty");
  });

  it("shows progress-aware Start, Continue, and Review actions", () => {
    expect(page).toContain('"Start course"');
    expect(page).toContain('"Continue"');
    expect(page).toContain('"Review"');
    expect(page).toContain("completedSteps");
    expect(page).toContain("/learn/openings/${lesson.slug}");
  });

  it("never introduces artificial locked courses", () => {
    expect(page.toLowerCase()).not.toContain("locked");
    expect(page.toLowerCase()).not.toContain("unlock");
  });

  it("loads the premium learning stylesheet", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    expect(main).toContain('import "./learning-premium.css"');
  });
});
