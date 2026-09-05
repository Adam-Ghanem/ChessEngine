import { describe, expect, it } from "vitest";
import { LESSONS } from "@/data/lessons";
import { findNextIncompleteLessonKey, findResumeLessonKey } from "./learnProgress";

describe("Learn resume continuity", () => {
  it("resumes a partially started lesson before untouched lessons", () => {
    expect(findResumeLessonKey({ "piece-activity": 1 })).toBe("piece-activity");
  });

  it("moves past completed lessons to the first unfinished lesson", () => {
    expect(findResumeLessonKey({ "checks-captures-threats": 3 })).toBe("piece-activity");
  });

  it("keeps the final lesson selected when the learning set is complete", () => {
    const complete = Object.fromEntries(LESSONS.map((lesson) => [lesson.key, lesson.checkpoints.length]));
    expect(findResumeLessonKey(complete)).toBe(LESSONS.at(-1)?.key);
  });

  it("finds the next unfinished lesson after a completion and wraps once", () => {
    expect(
      findNextIncompleteLessonKey("piece-activity", {
        "checks-captures-threats": 1,
        "piece-activity": 3,
        "blunder-check": 3,
      }),
    ).toBe("checks-captures-threats");
  });

  it("returns null when every lesson is complete", () => {
    const complete = Object.fromEntries(LESSONS.map((lesson) => [lesson.key, lesson.checkpoints.length]));
    expect(findNextIncompleteLessonKey("blunder-check", complete)).toBeNull();
  });
});
