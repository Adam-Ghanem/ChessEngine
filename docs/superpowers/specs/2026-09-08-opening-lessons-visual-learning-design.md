# ChessIQ Opening Lessons + Visual Learning — Phase 2A Design

## Goal

Extend the production ChessIQ `Learn` experience into a premium interactive opening-learning system built on the canonical Phase 1 opening catalog. Phase 2A ships exactly **100 complete opening courses**, each teaching ideas, plans, pawn structures, key squares, common mistakes, traps, and thematic moves through board-first lessons and legal-move checkpoints.

Phase 2A remains deterministic and education-first. It must not become an AI-generated lesson system, a second opening database, a CMS, or a catalog of empty cards.

## Current foundation

Phase 1 already provides canonical local ECO A00-E99 opening data under `app/shared/openings/`, `/openings`, opening detail, `/trainer`, interactive opening boards, White/Black repertoire training, SRS/mastery persistence, and the existing `Learn`/`lessonProgress` surfaces. Phase 2A reuses those boundaries.

## Architecture decision

Use curated project-owned lesson definitions referencing canonical opening node IDs/slugs. User progress stays in the existing application database. The canonical opening catalog remains authoritative for legal lines and identity.

Rejected alternatives:

- auto-generated lessons from the tree: too repetitive and strategically unreliable;
- CMS/database-authored lessons: unnecessary scope for this phase;
- LLM-generated prose: not deterministic enough for core educational content.

## Scope

### In scope

1. Upgrade `/learn` into a structured learning hub.
2. Add `/learn/openings/:lessonSlug` interactive lesson route.
3. Ship exactly **100 unique complete opening courses**.
4. Each course has 3–6 chapters and 8–20 ordered interactive steps.
5. Each course includes at least 2 legal move checkpoints.
6. Each course includes at least one strategic plan, one common mistake/trap, and one pawn-structure/key-square visual concept.
7. Support board playback, arrows, highlights, key-square groups, pawn emphasis, candidate-move markers, and authored instructional heatmap zones.
8. Deterministic correct/incorrect feedback from curated lesson definitions.
9. Authenticated resume/completion using existing lesson progress where practical.
10. Guest lessons remain fully usable without persistence.
11. Direct links from each course to the relevant Explorer node and Trainer flow.
12. Learn progress summary integrated with `/learn` and `/progress` where appropriate.
13. Existing mobile, theme, keyboard, reduced-motion, TypeScript, accessibility, and CI gates remain mandatory.

### Out of scope

- model-game browser (Phase 2B);
- engine/LLM generated lesson prose;
- free-form AI tutor;
- lesson CMS/admin UI;
- social/community lessons;
- one course per ECO code merely to inflate coverage;
- paid gating;
- replacing opening trainer SRS with lesson completion.

## 100-course coverage strategy

The 100 courses are pedagogically distinct openings/systems, not one-to-one ECO codes. Each course references one or more canonical opening nodes.

The registry is split into five 20-course families:

1. `e4.ts` — 20 e4/open-game courses.
2. `sicilian-defenses.ts` — 20 Sicilian/French/Caro-Kann/Pirc/Modern and related defense courses.
3. `d4.ts` — 20 Queen's Gambit, Slav/Semi-Slav, London/Colle and related d4 systems.
4. `indian-defenses.ts` — 20 King's Indian, Nimzo-Indian, Queen's Indian, Grünfeld, Benoni and related Indian systems.
5. `flank-and-systems.ts` — 20 English, Réti, Dutch, Bird, Catalan-related and other important flank/system courses.

Files live under `app/shared/learning/openings/` with a single registry in `index.ts` and validation in `validation.ts`.

The build contract requires exactly 100 globally unique course keys/slugs and exactly 20 courses from each family file.

## Course quality contract

Every course must satisfy all of the following:

- 3–6 chapters;
- 8–20 total steps;
- at least 2 checkpoint steps;
- at least 1 strategic plan explanation;
- at least 1 common mistake or trap warning;
- at least 1 pawn-structure/key-square/zone visual concept;
- at least 1 relevant Explorer link;
- at least 1 Trainer handoff line;
- every referenced opening node exists;
- every configured ply is valid;
- every accepted move is legal from the exact step position;
- all board squares in annotations are valid;
- authored feedback exists for every checkpoint;
- no placeholder prose such as `Learn this opening`, `TODO`, or generic repeated filler.

Quality matters more than forcing a course for every ECO code.

## Information architecture

### `/learn`

`Learn` becomes a learning hub with:

- existing chess foundations;
- a dedicated Opening Courses section;
- search and filters by family, side focus, difficulty, ECO, and tags;
- compact cards with title, objective, ECO range, difficulty, checkpoint count, and saved progress;
- states `Start`, `Continue`, and `Review`.

All 100 courses are discoverable. There is no artificial unlock gate; prerequisites may be shown as recommendations but must not block direct access.

### `/learn/openings/:lessonSlug`

Desktop:

1. left — chapter/step outline;
2. center — dominant board + move timeline;
3. right — explanation/checkpoint/visual legend.

Mobile:

1. course title/progress;
2. board;
3. explanation/checkpoint;
4. previous/next controls;
5. collapsible outline.

The board remains the primary visual anchor.

## Data model

```ts
export type OpeningLessonFamily =
  | "e4"
  | "sicilian-defenses"
  | "d4"
  | "indian-defenses"
  | "flank-and-systems";

export type OpeningLesson = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  family: OpeningLessonFamily;
  sideFocus: "white" | "black" | "both";
  difficulty: "beginner" | "intermediate" | "advanced";
  ecoRange: string;
  openingNodeIds: string[];
  prerequisites?: string[];
  tags: string[];
  chapters: OpeningLessonChapter[];
};

export type OpeningLessonChapter = {
  id: string;
  title: string;
  objective: string;
  steps: OpeningLessonStep[];
};

export type OpeningLessonStep = {
  id: string;
  kind: "explain" | "demonstrate" | "checkpoint" | "recap";
  openingNodeId: string;
  ply?: number;
  title: string;
  body: string;
  learningPoint?: "plan" | "mistake" | "trap" | "pawn-structure" | "key-square" | "thematic-break";
  annotations?: BoardAnnotation[];
  acceptedMoves?: string[];
  feedback?: { correct: string; incorrect: string };
};
```

## Visual learning model

Annotations are declarative and independent from prose:

- `arrow` — from/to squares;
- `highlight` — one or more squares;
- `key-squares` — named group of critical squares;
- `pawn-structure` — explicit pawn-square emphasis;
- `candidate-move` — expected move marker;
- `zone` — authored square-weight/category overlay used as an instructional heatmap.

No engine-derived pseudo-heatmap is shown. If authored visual data does not exist, no visual is fabricated.

The existing `OpeningBoardWorkspace` should be extended/factored for annotation rendering instead of cloning chessboard logic.

## Checkpoint behavior

1. Reconstruct the exact step position using canonical UCI moves and `chess.js`.
2. Reject illegal user moves immediately.
3. Compare legal moves to explicit `acceptedMoves`.
4. Show authored correct/incorrect feedback.
5. Allow retry and explicit reveal.
6. Advance only by learner action.
7. Lichess popularity and engine evaluation never determine lesson correctness.

## Progression and review

There is no mandatory unlock tree. The user can start any of the 100 courses.

Progress states:

- `not_started`;
- `in_progress`;
- `completed`.

Authenticated users persist `lessonKey`, status, completed step count, and completion timestamp through the existing `lessonProgress` table unless a failing contract proves richer state is required.

Resume step is derived deterministically from the ordered lesson steps and `completedSteps`.

Completed courses expose `Review lesson` and `Train this opening`; completion does not change repertoire mastery automatically.

The Learn hub may recommend next courses using explicit `prerequisites` and family/difficulty ordering, but recommendations never block access.

## API boundary

Extend the existing `learn` tRPC domain:

- `learn.catalog` — general lessons plus opening course cards;
- `learn.openingLesson({ slug })` — one validated curated course;
- `learn.progress` — existing authenticated progress read;
- `learn.saveProgress` — validates lesson key and maximum completed steps against the actual lesson.

Unknown keys/slugs and impossible progress values are rejected server-side.

## Component boundaries

Recommended additions:

- `app/client/src/pages/OpeningLessonPage.tsx`
- `app/client/src/components/learning/LessonOutline.tsx`
- `app/client/src/components/learning/LessonBoard.tsx`
- `app/client/src/components/learning/LessonExplanation.tsx`
- `app/client/src/components/learning/LessonCheckpoint.tsx`
- `app/client/src/components/learning/LessonFilters.tsx`
- `app/shared/learning/openings/types.ts`
- `app/shared/learning/openings/e4.ts`
- `app/shared/learning/openings/sicilian-defenses.ts`
- `app/shared/learning/openings/d4.ts`
- `app/shared/learning/openings/indian-defenses.ts`
- `app/shared/learning/openings/flank-and-systems.ts`
- `app/shared/learning/openings/index.ts`
- `app/shared/learning/openings/validation.ts`

## Data flow

1. `/learn` requests validated catalog cards.
2. Learner opens `/learn/openings/:lessonSlug`.
3. tRPC returns the curated lesson.
4. Client reconstructs each step position from canonical opening data.
5. Annotations render on the shared board.
6. Checkpoints evaluate locally for immediate feedback and are revalidated by the server before progress persistence.
7. Authenticated progress updates only the current user's lesson row.
8. Explorer/Trainer links use stable canonical opening slugs/node IDs.

No external service is required for lesson availability or correctness.

## Error handling

- missing canonical node: test/build failure;
- illegal accepted move or invalid ply: test/build failure;
- malformed annotation square: validation failure;
- unknown lesson slug: Not Found state;
- progress save failure: lesson stays usable and shows unsynced state;
- guest user: full lesson works, with sign-in CTA for persistence;
- canonical catalog changes: validation tests catch stale lesson references before release.

## Accessibility and mobile

Mandatory:

- visible keyboard focus;
- non-color-only correct/incorrect feedback;
- textual equivalent for arrows/zones in explanation copy;
- previous/next step controls with keyboard support;
- reduced-motion support;
- touch-safe controls on mobile;
- collapsible outline on narrow screens;
- no hover-only interaction.

## Testing strategy

TDD release gates:

1. exactly 100 courses and exactly 20 per family file;
2. unique course keys/slugs;
3. 3–6 chapters and 8–20 steps per course;
4. at least 2 checkpoints per course;
5. required plan/mistake-or-trap/visual learning points per course;
6. all referenced canonical nodes exist;
7. all plies and configured moves are legal;
8. all annotation squares are valid;
9. no placeholder/filler copy patterns;
10. checkpoint correct/alternative/wrong/illegal behavior;
11. deterministic resume calculation;
12. server rejects fabricated keys and impossible step counts;
13. user progress isolation;
14. `/learn/openings/:lessonSlug` routing contract;
15. Learn hub search/filter/progress contracts;
16. mobile/accessibility/reduced-motion contracts;
17. all existing Phase 1 opening/trainer tests remain green;
18. TypeScript, production builds, C++ tests, and sanitizer CI remain green.

## Completion gate

Phase 2A is complete only when all 100 courses satisfy the quality contract, every lesson is playable on desktop/mobile, authenticated users can resume/complete them, guests can use them without persistence, Explorer/Trainer handoffs work, no external service is needed for correctness, and all CI gates pass.

## Deferred Phase 2B/2C

Phase 2B adds model-game browsing and critical moments.

Phase 2C may add deterministic `Why this move?` intelligence using canonical lesson metadata plus ChessEngine analysis after separate design. It must not introduce uncontrolled generated prose into Phase 2A.