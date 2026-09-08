# ChessIQ Openings Explorer + Trainer Design

## Goal

Turn ChessIQ into a premium chess openings encyclopedia and interactive repertoire trainer while preserving the existing production architecture under `app/`.

Phase 1 focuses on two first-class product areas:

- a production-grade Openings Explorer covering ECO A00-E99;
- an interactive opening trainer with persisted mastery and spaced repetition.

The design must feel calm, premium, and education-first. It should reuse ChessIQ's current React/Vite, tRPC, Drizzle, authentication, theme, chess.js, and existing product shell rather than migrating to Next.js or creating a parallel application stack.

## Existing architecture constraints

The production application remains `app/`. The legacy `web/` directory is treated only as a source of reusable ideas or data structures, not as the production source of truth.

The implementation must preserve:

- the existing React/Vite client;
- Wouter routing;
- tRPC as the application API boundary;
- Drizzle/MySQL persistence;
- existing authentication and per-user isolation;
- `chess.js` as the browser-side legal move authority;
- the first-party C++ ChessEngine as the engine layer for analysis-related surfaces;
- current dark/light theming and product navigation patterns;
- existing mobile-first and accessibility quality gates.

No second frontend application, second router, second database layer, or direct client dependency on an external opening API is introduced.

## Scope

### In scope

1. `/openings` as a first-class product route.
2. `/openings/:slug` opening detail workspace.
3. `/trainer` opening trainer route.
4. ECO A00-E99 canonical local opening data architecture.
5. Search by opening name, alias, ECO code, SAN sequence, or UCI sequence.
6. Hierarchical opening tree: family -> variation -> subvariation -> line.
7. Interactive board playback and move navigation.
8. Live popularity and White/Draw/Black statistics through a server-side Lichess Opening Explorer proxy.
9. Graceful stale-cache fallback when live statistics are unavailable.
10. Opening repertoire selection by side.
11. Guided learning, recall, and mixed-review trainer modes.
12. Persisted opening review state, mastery, and spaced repetition for authenticated users.
13. Guest use of Explorer and Trainer without requiring account creation.
14. Opening progress integration into the existing Progress surface.
15. Premium responsive UI and accessibility support.

### Explicitly out of scope for Phase 1

- full opening lesson courses with historical essays;
- heatmaps of piece activity;
- generated pawn-structure diagrams beyond static metadata hooks;
- complete model-game browsing;
- automated engine-generated opening explanations;
- social repertoire sharing;
- collaborative repertoire editing;
- paid-plan gating;
- replacing the existing generic Learn surface;
- migrating ChessIQ to Next.js, Prisma, PostgreSQL, Zustand, or Jotai solely for this feature.

These are Phase 2+ opportunities once the Explorer and Trainer are stable.

## Product architecture

### Routes

Add the following routes to the existing application router:

- `/openings` -> `OpeningsPage`
- `/openings/:slug` -> `OpeningDetailPage`
- `/trainer` -> `OpeningTrainerPage`

Add `Openings` to the main product navigation. Trainer is reachable from opening detail pages and can also be exposed as a secondary action from Openings or Progress.

`Learn` remains the general educational area. Openings becomes a dedicated first-class domain rather than being nested inside generic lessons.

### Client modules

Recommended client boundaries:

- `app/client/src/pages/OpeningsPage.tsx`
- `app/client/src/pages/OpeningDetailPage.tsx`
- `app/client/src/pages/OpeningTrainerPage.tsx`
- `app/client/src/components/openings/OpeningTree.tsx`
- `app/client/src/components/openings/OpeningBoardWorkspace.tsx`
- `app/client/src/components/openings/OpeningStatsPanel.tsx`
- `app/client/src/components/openings/OpeningIdeaPanel.tsx`
- `app/client/src/components/openings/OpeningSearch.tsx`
- `app/client/src/components/openings/TrainerFeedback.tsx`
- `app/client/src/components/openings/TrainerSessionRail.tsx`
- `app/client/src/lib/openings/*`

Each component should have one clear responsibility. The Explorer must not become a monolithic page component.

### Shared canonical data

Canonical opening knowledge belongs in a project-owned shared module under a path such as:

- `app/shared/openings/`

The data should be split by ECO volume or another deterministic chunking strategy so the client does not need to load the entire world opening tree at once.

The canonical dataset is the source of truth for:

- ECO classification;
- opening names and aliases;
- parent/child relationships;
- SAN and UCI move lines;
- derived FENs or deterministic FEN reconstruction;
- variation structure;
- educational metadata;
- trainable positions;
- acceptable repertoire continuations.

External statistics never define trainer correctness.

## Canonical opening model

Each opening node should support at least:

```ts
export type OpeningNode = {
  id: string;
  slug: string;
  eco: string;
  name: string;
  aliases: string[];
  parentId: string | null;
  san: string[];
  uci: string[];
  fen: string;
  depth: number;
  summary?: string;
  ideasWhite?: string[];
  ideasBlack?: string[];
  pawnStructure?: string;
  keySquares?: string[];
  typicalPlans?: string[];
  traps?: string[];
  modelGames?: string[];
  trainable?: boolean;
  acceptableContinuations?: string[];
};
```

The exact type may evolve during implementation, but the following invariants are mandatory:

- IDs and slugs are unique;
- every non-root node references a valid parent;
- child moves extend the parent position legally;
- every stored UCI move sequence is legal from the starting position;
- ECO values are valid A00-E99 codes or well-defined ranges where appropriate;
- search metadata is normalized consistently;
- trainable nodes cannot reference illegal or contradictory continuations.

The legacy `web/client/src/data/openings.ts` dataset may be mined for reusable names, descriptions, aliases, and initial line data, but it is not complete enough to become the final canonical model unchanged.

## Openings Explorer UX

### Desktop layout

The primary desktop workspace is a three-column learning layout:

1. left: searchable expandable opening tree;
2. center: dominant chess board plus move timeline/navigation;
3. right: live statistics, plans, and context.

The board remains the strongest visual element.

### Opening tree

The tree must:

- group content by ECO family and variation hierarchy;
- expand/collapse without page reloads;
- support keyboard navigation;
- preserve the active node visually;
- scroll the active variation into view when navigation comes from the board or statistics table.

### Search

Search should support:

- exact and partial opening names;
- aliases;
- ECO codes;
- SAN-like move text such as `e4 e5 Nf3 Nc6 Bb5`;
- normalized UCI sequences when practical.

Search results must deep-link to the relevant opening node instead of only filtering top-level cards.

### Board navigation

Selecting any variation node or move-table row updates the board and move timeline without a full route reload.

The board workspace should support:

- previous/next move;
- first/last move;
- keyboard shortcuts;
- move arrows or highlights for the active continuation;
- current FEN derivation;
- board orientation by repertoire side.

### Opening detail

The detail page should include:

- ECO breadcrumb;
- opening name and aliases;
- concise opening character summary;
- interactive board and move line;
- variation tree;
- live statistics;
- White ideas;
- Black ideas;
- typical plans;
- traps metadata when available;
- clear `Train this line` action.

Phase 1 may present `Ideas`, `Plans`, `Traps`, and `Statistics` as tabs or collapsible sections, but the information architecture must leave room for future `Model games` and richer lessons.

## Hybrid statistics architecture

### Source of truth split

Local ChessIQ data is authoritative for:

- opening identity;
- opening tree;
- move legality;
- trainer lines;
- educational explanations.

Lichess Opening Explorer is used only for live statistical enrichment such as:

- move popularity;
- White/Draw/Black result counts or percentages;
- master-game sample size;
- ranked candidate moves.

### Server-side proxy

Add a tRPC surface such as:

- `openings.stats`

The browser must not call the Lichess API directly.

The server procedure receives a normalized position input and returns a typed ChessIQ response shape. External response validation is mandatory before data reaches the client.

### Cache

Cache entries are keyed by a normalized position identity, preferably a normalized FEN subset or another deterministic key that ignores irrelevant move counters where safe.

The cache should support:

- fresh live response;
- stale-while-error fallback;
- bounded TTL;
- no fabricated statistics.

If Lichess is unavailable, rate-limited, times out, or returns malformed data:

- return valid stale data when available;
- otherwise return an explicit unavailable state;
- never block canonical Explorer or Trainer functionality.

## Interactive Opening Trainer

### Entry points

Trainer sessions can start from:

- `Train this line` on any trainable variation;
- a White repertoire selection;
- a Black repertoire selection;
- a mixed due-review queue from Progress;
- a weak-line recommendation.

### Session modes

Phase 1 supports:

1. `Learn line`
   - guided;
   - explanations appear quickly;
   - suitable for first exposure.

2. `Recall`
   - no hints before the move;
   - tests memory and understanding.

3. `Mixed review`
   - pulls due material from multiple selected openings using SRS priority.

A repertoire-side filter supports White and Black practice independently.

### Trainer correctness

The trainer validates moves using two independent constraints:

1. the move must be legal according to `chess.js`;
2. the move must match one of the canonical acceptable continuations for the active training node.

A live Lichess move is never automatically considered correct merely because it is popular.

### Feedback

After a move, feedback may classify the answer as:

- Correct;
- Acceptable alternative;
- Inaccuracy;
- Wrong.

Phase 1 does not need engine-strength semantic grading. `Inaccuracy` may be reserved for deterministic repertoire alternatives known by the canonical dataset. If the implementation cannot define that safely, Phase 1 should use `Correct`, `Acceptable`, and `Wrong` rather than fabricate nuanced grading.

Feedback should include:

- the canonical move;
- a short plain-language explanation;
- board arrow/highlight;
- optional plan reminder;
- SRS quality controls: Again / Hard / Good / Easy.

Wrong answers should not cause immediate rote repetition only. The failed concept should be reinserted into the queue according to SRS/review logic.

## Spaced repetition and mastery

### Review state

Each trainable user/node pair should persist fields equivalent to:

```ts
{
  userId,
  openingNodeId,
  side,
  ease,
  intervalDays,
  dueAt,
  streak,
  lapses,
  lastResult,
  lastReviewedAt
}
```

Implementation may adapt field names to existing database conventions.

### Attempt evidence

Each meaningful trainer answer should record compact evidence such as:

- opening node;
- side;
- result;
- response time;
- hint usage;
- rating choice;
- timestamp.

The system should update the persisted review state at write time so Progress does not need to recalculate the entire attempt history on every request.

### Scheduler priority

The mixed queue should prioritize:

1. overdue weak lines;
2. recent mistakes/lapses;
3. critical branching points;
4. due normal reviews;
5. new lines.

The scheduling algorithm must be deterministic and unit-tested.

### Mastery

Mastery is not a simple completion percentage.

It should be derived from weighted factors such as:

- review coverage;
- recent accuracy;
- retention across intervals;
- overdue burden;
- critical-line weighting.

The exact formula belongs in an isolated pure function so it can evolve without changing persistence or UI contracts.

Recommended user-facing states:

- New;
- Learning;
- Weak;
- Solid;
- Mastered.

## Persistence

Add dedicated opening-learning persistence rather than overloading generic lesson progress.

Suggested tables:

- `openingReviewItems`
- `openingAttempts`

If a separate summarized opening-progress table materially simplifies reads, it may be added, but the design should prefer deriving opening-level summaries from review items unless profiling shows a real need.

All authenticated opening data is private per user. Every protected query must scope by `ctx.user.id`.

Guest sessions may remain local-only and must not fabricate synced state.

If a progress write fails, the trainer session continues and the UI surfaces an unsynced state rather than discarding the user's current session.

## Progress integration

Extend `/progress` with an `Opening Repertoire` area.

It should support:

- White repertoire summary;
- Black repertoire summary;
- mastery by opening family;
- due review count;
- weakest branches;
- recent accuracy;
- retention trend when enough data exists;
- `Continue training` action into the highest-priority due queue.

Opening detail pages should also show mastery by variation where user data exists.

## Visual system

### Direction

The product should feel expensive and calm rather than gamified.

Use:

- dark graphite default background;
- warm ivory foreground text;
- restrained emerald/teal accent usage;
- subtle glass surfaces;
- thin low-contrast borders;
- restrained shadows;
- excellent spacing and typography;
- premium chess pieces consistent with the current board architecture.

Avoid neon cyber styling, excessive gradients, oversized badges, or noisy engine information during training.

### Motion

Use Framer Motion only where motion improves comprehension:

- opening-tree expansion;
- panel transitions;
- move feedback;
- mastery-state changes;
- route-level content entrance where subtle.

Respect reduced-motion preferences.

## Mobile behavior

Mobile is board-first.

### Explorer

Recommended order:

1. opening identity / breadcrumb;
2. board;
3. move controls;
4. tree/statistics tabs or bottom sheets;
5. educational explanation;
6. persistent thumb-reachable `Train this line` action when appropriate.

The desktop three-column layout must collapse into a single-column experience.

### Trainer

Recommended order:

1. prompt/status;
2. board;
3. feedback/explanation;
4. SRS action controls;
5. session progress.

No desktop rail should survive in a way that forces horizontal scrolling.

## Accessibility

Required behavior:

- visible keyboard focus states;
- keyboard-accessible opening tree;
- board navigation controls with clear labels;
- accessible move buttons;
- adequate color contrast in both themes;
- reduced-motion support;
- screen-reader-friendly trainer feedback;
- no meaning conveyed only through color.

## Error handling

### Canonical data errors

Malformed canonical data is treated as a build/test failure, not a recoverable production state.

Automated validation must reject:

- illegal move sequences;
- missing parents;
- duplicate IDs/slugs;
- invalid ECO identifiers;
- impossible continuation relationships.

### External statistics errors

Invalid external payloads are discarded.

Expected UI states:

- loading;
- live;
- cached/stale;
- unavailable.

No fake percentages or fabricated master-game counts are allowed.

### Trainer errors

Illegal moves are rejected before repertoire evaluation.

A corrupt trainable node should be impossible in production because dataset validation is a release gate.

### Sync errors

Failed progress persistence does not end the trainer session. The client keeps the local session state and exposes a non-destructive unsynced indicator.

## Testing strategy

Use TDD for functional increments.

### Canonical data tests

- ECO code validity;
- unique IDs and slugs;
- parent/child integrity;
- every UCI line legal from start position;
- child line extends parent line correctly;
- trainable acceptable continuations are legal;
- search normalization and alias coverage.

### Explorer tests

- route registration;
- product navigation entry;
- search by name;
- search by ECO;
- search by aliases;
- search by moves;
- board/FEN synchronization;
- tree selection synchronization;
- deep-link opening detail resolution.

### Stats tests

- server-side proxy contract;
- external payload validation;
- timeout behavior;
- rate-limit behavior;
- fresh cache;
- stale cache fallback;
- unavailable state without fabricated data.

### Trainer tests

- correct canonical move;
- acceptable alternative;
- wrong move;
- illegal move rejection;
- side selection;
- variation branch selection;
- deterministic queue generation;
- Learn vs Recall mode behavior;
- feedback explanation contract.

### SRS/mastery tests

- Again/Hard/Good/Easy transitions;
- deterministic due dates under a fixed clock;
- lapse handling;
- overdue priority;
- weak-line priority;
- mastery boundaries;
- no cross-user leakage.

### UI quality gates

- responsive contract tests;
- keyboard navigation contracts;
- reduced-motion behavior where applicable;
- TypeScript `check`;
- Vitest suite;
- production build;
- existing app tests remain green;
- existing C++ release/sanitizer/perft/search CI remains green.

## Migration and rollout

Implement incrementally without disrupting current Play, Analyze, Learn, Puzzles, Games, Progress, or Coach routes.

Recommended release order:

1. canonical opening schema + validation;
2. `/openings` explorer shell and search;
3. opening detail board/tree navigation;
4. server-side live statistics proxy and cache;
5. trainer correctness and guided sessions;
6. review persistence and SRS;
7. Progress integration;
8. polish, responsive behavior, accessibility, and performance.

The legacy `web/` opening prototype can be used as reference material, but production implementation belongs in `app/` and should follow current ChessIQ product patterns.

## Success criteria

Phase 1 is complete when a user can:

- open ChessIQ and navigate to a dedicated Openings area;
- search and browse a canonical ECO A00-E99 hierarchy;
- navigate opening moves on an interactive legal board;
- inspect live opening popularity and result statistics when available;
- continue using the Explorer when external stats are unavailable;
- start training from a chosen opening line;
- receive deterministic move validation and useful explanations;
- train White and Black repertoires separately;
- complete guided, recall, and mixed-review sessions;
- return later and receive due reviews based on persisted SRS state;
- see opening mastery and weaknesses in Progress;
- use the complete experience comfortably on mobile and desktop;
- encounter no fabricated statistics, fake trainer correctness, or cross-user progress leakage.
