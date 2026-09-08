import { describe, expect, it } from "vitest";
import {
  D4_OPENING_PROFILES,
  E4_OPENING_PROFILES,
  FLANK_SYSTEM_PROFILES,
  INDIAN_DEFENSE_PROFILES,
  OPENING_LESSONS,
  SICILIAN_DEFENSE_PROFILES,
} from "./index";
import { validateOpeningLessons } from "./validation";

const familySets = [
  E4_OPENING_PROFILES,
  SICILIAN_DEFENSE_PROFILES,
  D4_OPENING_PROFILES,
  INDIAN_DEFENSE_PROFILES,
  FLANK_SYSTEM_PROFILES,
];

describe("opening lesson curriculum", () => {
  it("ships exactly 100 courses in five balanced families", () => {
    for (const family of familySets) expect(family).toHaveLength(20);
    expect(OPENING_LESSONS).toHaveLength(100);
  });

  it("uses globally unique course keys and slugs", () => {
    expect(new Set(OPENING_LESSONS.map(lesson => lesson.key)).size).toBe(100);
    expect(new Set(OPENING_LESSONS.map(lesson => lesson.slug)).size).toBe(100);
  });

  it("gives every course a complete multi-step curriculum", () => {
    for (const lesson of OPENING_LESSONS) {
      expect(lesson.chapters.length).toBeGreaterThanOrEqual(3);
      expect(lesson.chapters.length).toBeLessThanOrEqual(6);
      const steps = lesson.chapters.flatMap(chapter => chapter.steps);
      expect(steps.length).toBeGreaterThanOrEqual(8);
      expect(steps.length).toBeLessThanOrEqual(20);
      expect(steps.filter(step => step.kind === "checkpoint").length).toBeGreaterThanOrEqual(2);
      expect(steps.some(step => step.learningPoint === "plan")).toBe(true);
      expect(steps.some(step => step.learningPoint === "mistake" || step.learningPoint === "trap")).toBe(true);
      expect(steps.some(step => step.learningPoint === "pawn-structure" || step.learningPoint === "key-square")).toBe(true);
    }
  });

  it("passes canonical legality and authored-content validation", () => {
    expect(validateOpeningLessons(OPENING_LESSONS)).toEqual([]);
  });
});