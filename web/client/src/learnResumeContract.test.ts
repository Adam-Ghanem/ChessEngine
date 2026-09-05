import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const learnPage = readFileSync(new URL("./pages/Learn.tsx", import.meta.url), "utf8");

describe("Learn resume continuity", () => {
  it("opens the lesson that matches persisted progress", () => {
    expect(learnPage).toContain("findResumeLessonKey");
    expect(learnPage).toContain("useState(() => findResumeLessonKey");
  });

  it("offers the next unfinished lesson after completing the active lesson", () => {
    expect(learnPage).toContain("findNextIncompleteLessonKey");
    expect(learnPage).toContain("Continue to next lesson");
  });
});
