import { buildOpeningLesson } from "./builder";
import { D4_OPENING_PROFILES } from "./d4";
import { E4_OPENING_PROFILES } from "./e4";
import { FLANK_SYSTEM_PROFILES } from "./flank-and-systems";
import { INDIAN_DEFENSE_PROFILES } from "./indian-defenses";
import { SICILIAN_DEFENSE_PROFILES } from "./sicilian-defenses";

export { D4_OPENING_PROFILES } from "./d4";
export { E4_OPENING_PROFILES } from "./e4";
export { FLANK_SYSTEM_PROFILES } from "./flank-and-systems";
export { INDIAN_DEFENSE_PROFILES } from "./indian-defenses";
export { SICILIAN_DEFENSE_PROFILES } from "./sicilian-defenses";
export * from "./types";

const PROFILES = [
  ...E4_OPENING_PROFILES,
  ...SICILIAN_DEFENSE_PROFILES,
  ...D4_OPENING_PROFILES,
  ...INDIAN_DEFENSE_PROFILES,
  ...FLANK_SYSTEM_PROFILES,
];

export const OPENING_LESSONS = PROFILES.map(buildOpeningLesson);

const BY_SLUG = new Map(OPENING_LESSONS.map(lesson => [lesson.slug, lesson]));
const BY_KEY = new Map(OPENING_LESSONS.map(lesson => [lesson.key, lesson]));

export function getOpeningLessonBySlug(slug: string) {
  return BY_SLUG.get(slug) ?? null;
}

export function getOpeningLessonByKey(key: string) {
  return BY_KEY.get(key) ?? null;
}
