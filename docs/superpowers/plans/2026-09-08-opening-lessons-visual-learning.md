# ChessIQ Opening Lessons + Visual Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship exactly 100 complete, interactive, visual opening courses in ChessIQ Learn, backed by the canonical Phase 1 opening catalog and existing per-user lesson progress.

**Architecture:** Store 100 authored course profiles in five 20-course family modules under `app/shared/learning/openings/`. A deterministic curriculum builder converts each profile plus a resolved canonical opening node into 8–12 ordered lesson steps with course-specific authored strategy, mistake/trap, structure, and checkpoint content; validation rejects missing nodes, illegal moves, malformed annotations, duplicate IDs, placeholder copy, and any course that misses the quality contract. Reuse the existing `learn` tRPC domain, `lessonProgress`, and `OpeningBoardWorkspace` rather than introducing a new data store or board.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Wouter, tRPC 11, Drizzle/MySQL, chess.js 1.4, Vitest, existing ChessIQ UI/CSS system.

**Spec:** `docs/superpowers/specs/2026-09-08-opening-lessons-visual-learning-design.md`

## Global Constraints

- Ship exactly 100 unique opening courses and exactly 20 profiles from each of the five family modules.
- Every course has 3–6 chapters, 8–20 steps, at least 2 checkpoints, at least one strategic plan, one mistake/trap, and one visual pawn/key-square/zone concept.
- All lesson positions, plies, accepted moves, and annotation squares are validated against the local canonical opening catalog with `chess.js`.
- No Lichess or external API is required for lesson correctness or availability.
- No LLM/engine-generated lesson prose, empty cards, placeholder copy, second database layer, CMS, or artificial unlock gate.
- Existing `lessonProgress` remains the default persistence model; opening trainer mastery remains separate.
- Existing Phase 1 opening/trainer behavior, TypeScript, accessibility, production builds, C++ tests, and sanitizer CI remain green.

---

### Task 1: Lesson Types, Curriculum Builder, and 100 Authored Profiles

**Files:**
- Create: `app/shared/learning/openings/types.ts`
- Create: `app/shared/learning/openings/builder.ts`
- Create: `app/shared/learning/openings/e4.ts`
- Create: `app/shared/learning/openings/sicilian-defenses.ts`
- Create: `app/shared/learning/openings/d4.ts`
- Create: `app/shared/learning/openings/indian-defenses.ts`
- Create: `app/shared/learning/openings/flank-and-systems.ts`
- Create: `app/shared/learning/openings/index.ts`
- Create: `app/shared/learning/openings/validation.ts`
- Create: `app/shared/learning/openings/openingLessons.test.ts`

**Interfaces:**
- Produces `OpeningLesson`, `OpeningLessonProfile`, `OpeningLessonStep`, `BoardAnnotation`, `OPENING_LESSONS`, `getOpeningLessonBySlug`, `getOpeningLessonByKey`, `validateOpeningLessons`.
- `OpeningLessonProfile` contains authored title/summary/strategy/mistake/trap/structure/key-square/checkpoint guidance plus a canonical opening selector.
- `buildOpeningLesson(profile)` resolves a real canonical node and creates the ordered curriculum without inventing strategic prose.

- [ ] **Step 1: Write failing integrity tests**

```ts
import { describe, expect, it } from "vitest";
import {
  E4_OPENING_PROFILES,
  SICILIAN_DEFENSE_PROFILES,
  D4_OPENING_PROFILES,
  INDIAN_DEFENSE_PROFILES,
  FLANK_SYSTEM_PROFILES,
  OPENING_LESSONS,
} from "./index";
import { validateOpeningLessons } from "./validation";

it("ships exactly 100 courses in five 20-course families", () => {
  expect(E4_OPENING_PROFILES).toHaveLength(20);
  expect(SICILIAN_DEFENSE_PROFILES).toHaveLength(20);
  expect(D4_OPENING_PROFILES).toHaveLength(20);
  expect(INDIAN_DEFENSE_PROFILES).toHaveLength(20);
  expect(FLANK_SYSTEM_PROFILES).toHaveLength(20);
  expect(OPENING_LESSONS).toHaveLength(100);
});

it("satisfies the complete lesson quality contract", () => {
  expect(validateOpeningLessons(OPENING_LESSONS)).toEqual([]);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `cd app && pnpm vitest run shared/learning/openings/openingLessons.test.ts`
Expected: FAIL because the learning modules do not exist.

- [ ] **Step 3: Define focused types**

```ts
export type LessonFamily = "e4" | "sicilian-defenses" | "d4" | "indian-defenses" | "flank-and-systems";
export type LessonSideFocus = "white" | "black" | "both";
export type BoardAnnotation =
  | { kind: "arrow"; from: string; to: string; label: string }
  | { kind: "highlight" | "key-squares" | "pawn-structure" | "zone"; squares: string[]; label: string }
  | { kind: "candidate-move"; move: string; label: string };

export type OpeningLessonProfile = {
  key: string;
  slug: string;
  title: string;
  family: LessonFamily;
  sideFocus: LessonSideFocus;
  difficulty: "beginner" | "intermediate" | "advanced";
  ecoRange: string;
  canonicalQuery: string;
  summary: string;
  strategicPlan: string;
  opponentPlan: string;
  commonMistake: string;
  trapWarning: string;
  structureIdea: string;
  thematicBreak: string;
  keySquares: string[];
  tags: string[];
};
```

- [ ] **Step 4: Implement a deterministic builder**

Resolve each profile using `searchOpenings(profile.canonicalQuery, 20)` and choose the highest-confidence exact-name/normalized-name result with a legal line of sufficient depth. The builder creates 3 chapters and at least 8 steps: identity/character, development demonstration, strategic plan, pawn/key-square visual, common mistake, trap warning, checkpoint one, thematic break/checkpoint two, and recap. Step bodies interpolate only authored profile facts plus canonical move notation; they must never synthesize new strategic claims.

- [ ] **Step 5: Author 100 distinct profiles**

Create exactly 20 profiles per family file. Profiles must use real opening/system names present in the canonical catalog, distinct strategic summaries, distinct mistakes/traps where relevant, and valid key squares. Prefer broad pedagogically distinct openings rather than near-duplicate move-order labels.

- [ ] **Step 6: Implement validation**

Validation checks: exact counts, duplicate keys/slugs, chapter/step bounds, checkpoint minimum, required learning-point coverage, canonical-node resolution, valid ply, legal checkpoint moves, annotation-square regex, profile text non-empty/minimum useful length, and a denylist for placeholder patterns such as `TODO`, `TBD`, `Learn this opening`, or empty repeated filler.

- [ ] **Step 7: Run focused tests and TypeScript**

Run: `cd app && pnpm vitest run shared/learning/openings/openingLessons.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 8: Commit**

Commit: `feat: add 100 validated opening lesson curricula`

---

### Task 2: Pure Lesson Runtime and Checkpoint Logic

**Files:**
- Create: `app/shared/learning/openings/runtime.ts`
- Create: `app/shared/learning/openings/runtime.test.ts`

**Interfaces:**
- Produces `flattenLessonSteps(lesson)`, `getLessonStepPosition(step)`, `evaluateLessonMove(step, uci)`, `resumeLessonIndex(lesson, completedSteps)`.
- `evaluateLessonMove` returns `illegal | wrong | correct` and never calls an external service.

- [ ] **Step 1: Write failing runtime tests**

Cover exact FEN reconstruction, legal accepted move, legal wrong move, illegal move, accepted alternatives, and resume clamping at 0/last step.

- [ ] **Step 2: Verify RED**

Run: `cd app && pnpm vitest run shared/learning/openings/runtime.test.ts`
Expected: FAIL because runtime functions do not exist.

- [ ] **Step 3: Implement runtime helpers with chess.js**

Replay the canonical node prefix to `step.ply`, evaluate user moves against exact legal moves, and clamp persisted progress to the lesson's actual flattened step count.

- [ ] **Step 4: Run focused tests**

Run: `cd app && pnpm vitest run shared/learning/openings/runtime.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat: add deterministic opening lesson runtime`

---

### Task 3: Extend Learn tRPC Catalog and Progress Validation

**Files:**
- Modify: `app/server/routers.ts`
- Modify: `app/server/catalog.ts` only if needed to preserve general lesson cards
- Create: `app/server/openingLessonsApi.test.ts`

**Interfaces:**
- Produces `learn.catalog` with `kind: "foundation" | "opening"` cards.
- Produces `learn.openingLesson({ slug })`.
- `learn.saveProgress` accepts dynamic validated lesson keys and rejects `completedSteps` above the actual lesson count.

- [ ] **Step 1: Write failing API contract tests**

Test that all 100 opening cards appear, a known slug returns the complete lesson, unknown slug throws, fabricated key is rejected, and completed steps cannot exceed the actual lesson length.

- [ ] **Step 2: Verify RED**

Run: `cd app && pnpm vitest run server/openingLessonsApi.test.ts`
Expected: FAIL on missing opening lesson API/dynamic validation.

- [ ] **Step 3: Extend the existing `learn` router**

Do not create a second router. Return compact cards for catalog calls and full lesson content only from `openingLesson`. Validate progress server-side against either the existing foundation catalog or `OPENING_LESSONS`.

- [ ] **Step 4: Preserve user isolation**

All reads/writes continue to call DB helpers with `ctx.user.id`; do not change `lessonProgress` ownership semantics.

- [ ] **Step 5: Run focused tests and TypeScript**

Run: `cd app && pnpm vitest run server/openingLessonsApi.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: expose opening courses through learn API`

---

### Task 4: Visual Annotation Support on the Shared Board

**Files:**
- Modify: `app/client/src/components/openings/OpeningBoardWorkspace.tsx`
- Create: `app/client/src/components/learning/BoardAnnotations.tsx` only if overlay rendering cannot stay focused inside the board component
- Create: `app/client/src/lessonBoardContract.test.ts`

**Interfaces:**
- Extend `OpeningBoardWorkspaceProps` with `annotations?: BoardAnnotation[]`.
- Existing explorer/trainer props and behavior remain backwards compatible.

- [ ] **Step 1: Write failing board contract tests**

Assert annotation prop exists, arrows/zones/key squares have non-color text labels or accessible equivalents, and existing trainer interactive callbacks remain present.

- [ ] **Step 2: Verify RED**

Run: `cd app && pnpm vitest run client/src/lessonBoardContract.test.ts`
Expected: FAIL before annotation support exists.

- [ ] **Step 3: Add visual overlays without cloning board logic**

Render square highlights/zone intensity through CSS classes/data attributes and arrows through an absolutely positioned SVG overlay with `pointer-events: none`. Preserve square buttons as the only interaction layer.

- [ ] **Step 4: Add accessibility/reduced-motion behavior**

Annotation labels are surfaced in lesson explanation text/legend; animations disable under `prefers-reduced-motion`.

- [ ] **Step 5: Run tests and TypeScript**

Run: `cd app && pnpm vitest run client/src/lessonBoardContract.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: add visual lesson annotations to chess board`

---

### Task 5: Learn Hub with 100-Course Discovery

**Files:**
- Modify: `app/client/src/pages/LearnPage.tsx`
- Create: `app/client/src/components/learning/LessonFilters.tsx`
- Create: `app/client/src/learnHubContract.test.ts`
- Create/Modify: `app/client/src/learning-premium.css`

**Interfaces:**
- Consumes `trpc.learn.catalog` and `trpc.learn.progress`.
- Search/filter state supports text, family, side focus, difficulty, and tags.

- [ ] **Step 1: Write failing hub contracts**

Assert the Learn page exposes Opening Courses, searchable/filterable cards, progress-aware Start/Continue/Review actions, and no artificial locked state.

- [ ] **Step 2: Verify RED**

Run: `cd app && pnpm vitest run client/src/learnHubContract.test.ts`
Expected: FAIL against the current simple Learn page.

- [ ] **Step 3: Build the learning hub**

Keep foundations visible, add a premium Opening Courses section, course count, filters, concise cards, progress bars, and route links to `/learn/openings/:slug`. Do not render all course bodies on the hub.

- [ ] **Step 4: Implement responsive/accessibility behavior**

Use semantic form labels, keyboard-focusable cards/actions, compact mobile filters, no hover-only controls, and no fabricated time estimates.

- [ ] **Step 5: Run tests and TypeScript**

Run: `cd app && pnpm vitest run client/src/learnHubContract.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: turn Learn into a 100-course opening hub`

---

### Task 6: Interactive Opening Lesson Page

**Files:**
- Create: `app/client/src/pages/OpeningLessonPage.tsx`
- Create: `app/client/src/components/learning/LessonOutline.tsx`
- Create: `app/client/src/components/learning/LessonExplanation.tsx`
- Create: `app/client/src/components/learning/LessonCheckpoint.tsx`
- Modify: `app/client/src/App.tsx`
- Modify: `app/client/src/learning-premium.css`
- Create: `app/client/src/openingLessonContract.test.ts`

**Interfaces:**
- Route `/learn/openings/:lessonSlug`.
- Uses `getLessonStepPosition`/`evaluateLessonMove` for immediate UI feedback.
- Persists monotonic completed-step progress for authenticated users; guest state stays local.

- [ ] **Step 1: Write failing page contracts**

Assert route registration, outline/board/explanation regions, previous/next, checkpoint feedback, guest save CTA, unsynced state, Explorer link, and Trainer link.

- [ ] **Step 2: Verify RED**

Run: `cd app && pnpm vitest run client/src/openingLessonContract.test.ts`
Expected: FAIL because the route/page do not exist.

- [ ] **Step 3: Implement board-first lesson flow**

Desktop uses outline | board | lesson panel. Mobile uses title/progress | board | lesson panel | navigation | collapsible outline. Course positions are deterministic and step transitions never require network statistics.

- [ ] **Step 4: Implement checkpoints**

Illegal -> explicit illegal feedback; legal wrong -> authored explanation and retry/reveal; accepted -> authored correct explanation and enables forward progress. Correctness never depends on engine or live popularity.

- [ ] **Step 5: Implement persistence and failure behavior**

Authenticated progress saves only when `completedSteps` increases. A save error shows `Not synced` while the local session remains playable. Guests receive a sign-in-to-save action without losing lesson access.

- [ ] **Step 6: Run tests and TypeScript**

Run: `cd app && pnpm vitest run client/src/openingLessonContract.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 7: Commit**

Commit: `feat: add interactive visual opening lesson workspace`

---

### Task 7: Learn Progress Integration and Final Verification

**Files:**
- Modify: `app/client/src/pages/ProgressPage.tsx` or add a focused learning progress component if needed
- Modify: `README.md` or `app/README.md` with Phase 2A behavior
- Create: `app/client/src/openingLessonProgressContract.test.ts`

**Interfaces:**
- Completed/in-progress opening lessons are summarized separately from opening trainer mastery.

- [ ] **Step 1: Write failing progress contract**

Assert learning progress shows course completion/in-progress counts and a Continue learning action without presenting lesson completion as repertoire mastery.

- [ ] **Step 2: Verify RED, then implement the focused progress surface**

Run: `cd app && pnpm vitest run client/src/openingLessonProgressContract.test.ts`
Expected before implementation: FAIL. After implementation: PASS.

- [ ] **Step 3: Run complete application quality gates**

Run: `cd app && pnpm test && pnpm check && pnpm build`
Expected: PASS, including all existing Phase 1 tests.

- [ ] **Step 4: Run repository C++ release/sanitizer CI through the normal PR workflows**

Expected: Build and Test, sanitizer, and Frontend Quality all succeed on the exact PR head SHA.

- [ ] **Step 5: Review diff for placeholders and regressions**

Search changed files for `TODO`, `TBD`, placeholder copy, duplicate board implementations, direct external API calls from lesson code, and accidental trainer mastery writes.

- [ ] **Step 6: Commit documentation/polish**

Commit: `docs: document 100-course visual opening learning`

- [ ] **Step 7: Open PR and merge only after exact-head verification**

Create a PR against `main`. Confirm no unresolved review threads, exact-head CI green, and mergeability true before integrating.