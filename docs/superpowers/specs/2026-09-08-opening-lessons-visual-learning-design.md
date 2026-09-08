# ChessIQ Opening Lessons + Visual Learning — Phase 2A Design

## Goal

Extend the production ChessIQ `Learn` experience into an interactive opening-learning system that teaches ideas, plans, pawn structures, key squares, traps, and thematic moves using the canonical opening catalog and board components already shipped in Phase 1.

Phase 2A is education-first. It must not become an AI-generated lesson system, a second opening database, or a CMS project.

## Current foundation

Phase 1 already provides:

- canonical local ECO A00-E99 opening data under `app/shared/openings/`;
- `/openings`, opening detail, and `/trainer` routes;
- interactive opening board components;
- White/Black repertoire training;
- user-scoped SRS/mastery persistence;
- live Lichess statistics as enrichment only;
- the existing generic `Learn` route and `lessonProgress` persistence.

Phase 2A reuses these boundaries instead of duplicating them.

## Approaches considered

### A. Curated lesson definitions referencing canonical opening nodes — recommended

Create project-owned lesson descriptors that reference existing opening node IDs/slugs and define educational steps, board annotations, checkpoints, and explanations.

Pros: deterministic, reviewable, testable, offline-capable, no hallucinations, reuses Phase 1 data.

Cons: lesson content must be authored and maintained.

### B. Generate lessons automatically from the opening tree

Derive lessons from names, move lines, and generic opening principles.

Pros: broad coverage quickly.

Cons: weak pedagogy, repetitive explanations, no trustworthy strategic meaning. Rejected for Phase 2A.

### C. Add a database/CMS-backed lesson authoring system

Store lessons as mutable admin content.

Pros: future editorial flexibility.

Cons: introduces authoring/admin scope unrelated to the learning experience. Deferred.

Decision: use Approach A. Lesson content is static project-owned data, while user completion remains persisted through the existing application database.

## Scope

### In scope

1. Upgrade `/learn` into a structured learning hub.
2. Add `/learn/openings/:lessonSlug` interactive opening lesson route.
3. Ship an initial curated lesson set covering the major opening families already useful to beginners/intermediate players.
4. Support lesson chapters/steps with board positions and move playback.
5. Visual annotations: arrows, highlighted squares, key-square groups, pawn-structure emphasis, and move targets.
6. Educational sections: opening character, strategic ideas, typical plans, common mistakes, thematic pawn breaks, traps/warnings, and recap.
7. Interactive checkpoints where the learner chooses or plays a move.
8. Deterministic feedback sourced from curated lesson definitions and canonical legal continuations.
9. Resume lesson state and completion for authenticated users using existing lesson progress persistence where practical.
10. Guest lessons remain usable without saving progress.
11. Link lessons back to the relevant Opening Explorer detail and `Train this line` flow.
12. Responsive/mobile board-first UX, keyboard support, reduced motion, and existing theme support.
13. Progress summary for opening lessons on `/learn` and existing `/progress` surfaces where appropriate.

### Explicitly out of scope

- complete model-game browser (Phase 2B);
- engine-generated or LLM-generated prose;
- free-form AI tutor/chat;
- editable lesson CMS/admin UI;
- social/community lessons;
- complete visualization of every ECO node;
- automatic prose generation from Lichess statistics;
- replacing opening trainer SRS with lesson progress;
- paid gating.

## Information architecture

### `/learn`

The Learn landing page becomes a learning hub with two clear families:

- general chess foundations (existing lessons);
- opening courses.

Opening-course cards show:

- opening/family name;
- ECO range when relevant;
- short learning objective;
- difficulty;
- estimated checkpoint count, not fabricated time estimates;
- saved progress when authenticated;
- `Start` / `Continue` / `Review` state.

The page should remain calm and compact rather than becoming a catalog wall.

### `/learn/openings/:lessonSlug`

Desktop layout:

1. left: lesson chapter/step rail;
2. center: dominant board plus move timeline;
3. right: explanation/checkpoint panel.

Mobile layout:

1. lesson title/progress;
2. board;
3. explanation/checkpoint;
4. collapsible lesson outline.

The board remains the primary visual anchor.

## Lesson data model

Create a shared curated lesson module such as `app/shared/learning/openingLessons.ts`.

Recommended model:

```ts
export type OpeningLesson = {
  key: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  openingNodeIds: string[];
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
  annotations?: BoardAnnotation[];
  acceptedMoves?: string[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
};
```

Exact field names may evolve, but these invariants are mandatory:

- every referenced opening node exists in the canonical catalog;
- every referenced ply is valid for that node;
- every accepted checkpoint move is legal from the step position;
- explanations and feedback are authored, not inferred from external stats;
- step IDs are unique within a lesson;
- lesson keys/slugs are globally unique;
- all annotations reference valid board squares.

## Initial curated lesson set

Phase 2A should prioritize pedagogical coverage rather than trying to create a lesson for all 500 ECO codes.

Initial families:

- Italian Game;
- Ruy Lopez;
- Sicilian Defense;
- French Defense;
- Caro-Kann Defense;
- Queen's Gambit;
- Slav Defense;
- King's Indian Defense;
- Nimzo-Indian Defense;
- English Opening;
- London System.

Each course should teach the characteristic plans of the family rather than memorizing long forced sequences.

Completion quality matters more than adding additional families.

## Visual learning system

### Annotation model

Create reusable board annotations independent of lesson prose:

- arrow: from/to squares;
- highlight: one or more squares;
- key-square group;
- pawn-structure emphasis;
- candidate-move marker.

Annotations are declarative data. The board renderer consumes them but does not infer strategic meaning.

### Pawn structures

Phase 2A does not need a second chessboard implementation. Pawn structures are shown on the existing board using:

- current lesson FEN/position;
- pawn-square emphasis;
- labelled explanation cards describing breaks, weaknesses, and target squares.

No synthetic heatmap is displayed unless the data is explicitly authored.

### Heatmaps

For Phase 2A, "heatmap" means an authored instructional overlay with explicit square weights/categories, not engine-derived pseudo-precision.

Examples:

- central-control squares;
- kingside attack zone;
- queenside expansion zone;
- weak-square cluster.

If no authored data exists, the UI shows no heatmap rather than generating one.

## Interactive checkpoints

Checkpoint steps reuse `chess.js` legality rules and canonical opening data.

Flow:

1. load exact lesson position;
2. learner chooses/plays a move;
3. reject illegal moves immediately;
4. compare legal move against curated `acceptedMoves`;
5. show authored correct/incorrect explanation;
6. allow retry or reveal answer depending on step config;
7. advance only through explicit learner action.

A checkpoint must never use Lichess popularity as correctness.

When several sound thematic moves are intended, all accepted alternatives are explicitly listed.

## Progress and persistence

The existing `lessonProgress` table remains the primary high-level lesson completion store for Phase 2A.

To avoid a premature schema expansion, persisted progress stores:

- lesson key;
- status;
- completed step count;
- completion timestamp through the existing model.

The client determines the resume step from the deterministic ordered lesson definition and `completedSteps`.

If implementation discovers that chapter-specific branching requires richer state, Phase 2A may add a dedicated `openingLessonProgress` table only after a failing contract test demonstrates the existing model is insufficient. The default design does not add that table.

Opening trainer mastery remains separate from lesson completion. Completing a lesson must not fabricate repertoire mastery.

## API boundary

Extend the existing `learn` tRPC domain rather than creating a new router stack.

Recommended procedures:

- `learn.catalog` — return general + opening learning cards;
- `learn.openingLesson({ slug })` — return validated lesson content suitable for the client;
- `learn.progress` — existing authenticated progress read;
- `learn.saveProgress` — accept the expanded validated lesson-key space and bounded completed-step count.

Server validation must reject unknown lesson keys and completed-step counts greater than the lesson's actual step count.

## Component boundaries

Recommended additions:

- `app/client/src/pages/OpeningLessonPage.tsx`
- `app/client/src/components/learning/LessonOutline.tsx`
- `app/client/src/components/learning/LessonBoard.tsx`
- `app/client/src/components/learning/LessonExplanation.tsx`
- `app/client/src/components/learning/LessonCheckpoint.tsx`
- `app/client/src/components/learning/BoardAnnotations.tsx` or annotation support factored into the existing opening board component
- `app/shared/learning/openingLessons.ts`
- `app/shared/learning/lessonValidation.ts`

Prefer extending/factoring `OpeningBoardWorkspace` for annotation rendering rather than cloning chessboard logic.

## Data flow

1. `/learn` requests the validated catalog.
2. learner opens an opening lesson.
3. tRPC returns curated lesson data referencing canonical opening nodes.
4. client reconstructs the requested position with canonical UCI moves and `chess.js`.
5. annotation data is rendered over the shared board.
6. checkpoints are evaluated locally for immediate feedback and revalidated against the curated definition before persisted progress changes.
7. authenticated progress writes update only the user's lesson progress row.
8. links to Explorer/Trainer pass stable opening slugs/node IDs.

No external API is required for lesson correctness or availability.

## Error handling

- missing opening node reference: test/build failure;
- illegal configured accepted move: test/build failure;
- unknown lesson slug: Not Found state, not blank board;
- malformed step annotations: validation failure;
- progress save failure: lesson remains usable and shows unsynced state;
- guest user: lesson works, save CTA explains sign-in benefit;
- canonical opening data changes: validation tests identify stale lesson references before release.

## Accessibility and mobile

Mandatory behavior:

- visible keyboard focus;
- non-color-only distinction for correct/incorrect checkpoint state;
- board annotations have text equivalents in explanation copy;
- arrow-key or explicit previous/next lesson-step controls;
- reduced-motion support for step/annotation transitions;
- touch targets remain usable on mobile;
- lesson outline is collapsible on narrow screens;
- board does not require hover interactions.

## Testing strategy

TDD gates include:

1. lesson catalog validation tests;
2. all referenced opening nodes exist;
3. all configured plies and moves are legal;
4. unique lesson/chapter/step IDs;
5. annotation square validation;
6. checkpoint correct/alternative/wrong/illegal behavior;
7. resume-step calculation from persisted `completedSteps`;
8. server rejects fabricated lesson keys and impossible step counts;
9. user progress isolation;
10. `/learn/openings/:lessonSlug` routing contract;
11. Learn hub card/progress contract;
12. mobile/accessibility/reduced-motion contracts;
13. existing Phase 1 opening/trainer tests remain green;
14. TypeScript, production build, C++ build/tests, and sanitizer CI remain green.

## Completion gate

Phase 2A is complete when:

- the curated opening lesson set ships with validated legal content;
- each listed family has at least one complete multi-step course;
- lesson board annotations and checkpoints work on desktop/mobile;
- authenticated learners can resume and complete lessons;
- guest learners can use lessons without persistence;
- lessons link cleanly to Explorer and Trainer;
- no external service is required for lesson correctness;
- all new and existing CI quality gates pass.

## Deferred Phase 2B/2C

Phase 2B will add model-game browsing and critical moments.

Phase 2C may add a deterministic `Why this move?` intelligence layer using canonical lesson metadata and ChessEngine analysis, but only after explicit design work. It must not be implemented as uncontrolled generated prose in Phase 2A.
