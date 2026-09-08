import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(relative: string) {
  try {
    return readFileSync(new URL(relative, import.meta.url), "utf8");
  } catch {
    return "";
  }
}

describe("interactive opening lesson workspace", () => {
  const app = source("./App.tsx");
  const page = source("./pages/OpeningLessonPage.tsx");

  it("registers a first-class opening lesson route", () => {
    expect(app).toContain('import OpeningLessonPage from "./pages/OpeningLessonPage"');
    expect(app).toContain('<Route path="/learn/openings/:lessonSlug" component={OpeningLessonPage} />');
  });

  it("uses the shared board and deterministic lesson runtime", () => {
    expect(page).toContain('OpeningBoardWorkspace');
    expect(page).toContain('getLessonStepPosition');
    expect(page).toContain('evaluateLessonMove');
    expect(page).toContain('annotations={currentStep.annotations');
  });

  it("renders outline, explanation, checkpoint, and previous/next navigation", () => {
    expect(page).toContain('LessonOutline');
    expect(page).toContain('LessonExplanation');
    expect(page).toContain('LessonCheckpoint');
    expect(page).toContain('"Previous"');
    expect(page).toContain('"Next"');
  });

  it("handles illegal, wrong, and correct checkpoint feedback locally", () => {
    expect(page).toContain('evaluation.kind === "illegal"');
    expect(page).toContain('evaluation.kind === "wrong"');
    expect(page).toContain('evaluation.kind === "correct"');
    expect(page).toContain('feedback?.incorrect');
    expect(page).toContain('feedback?.correct');
  });

  it("supports local guest study and visible save failure state", () => {
    expect(page).toContain('Sign in to save progress');
    expect(page).toContain('Not synced');
    expect(page).toContain('completedSteps');
    expect(page).toContain('saveProgress');
  });

  it("keeps Explorer and Trainer handoffs inside the lesson workspace", () => {
    expect(page).toContain('/openings/${lesson.openingSlug}');
    expect(page).toContain('/trainer?slug=${encodeURIComponent(lesson.openingSlug)}');
  });

  it("defines the three focused learning components", () => {
    expect(source("./components/learning/LessonOutline.tsx")).toContain('aria-label="Course outline"');
    expect(source("./components/learning/LessonExplanation.tsx")).toContain('lesson-explanation');
    expect(source("./components/learning/LessonCheckpoint.tsx")).toContain('lesson-checkpoint');
  });
});
