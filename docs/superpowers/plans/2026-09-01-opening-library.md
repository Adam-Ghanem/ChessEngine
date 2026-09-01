# ChessIQ Opening Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade ChessIQ opening explorer and trainer covering the complete ECO A00-E99 catalog with legal move replay, original ChessIQ teaching content, search, transpositions, and opening-specific practice.

**Architecture:** Import a pinned CC0 factual opening dataset into deterministic generated artifacts, expose it through focused catalog/search/progress modules, then build explorer/detail/training routes on top of the existing `web/` production frontend. Factual opening data stays separate from original ChessIQ teaching content so upstream refreshes cannot overwrite lessons. Existing board utilities and the first-party C++ ChessEngine remain authoritative for move legality and validation.

**Tech Stack:** React 19, TypeScript 5.6, Vite 7, Vitest 2, Wouter, Lucide React, pnpm, Node/tsx generation scripts, first-party C++20 ChessEngine built with g++.

**Spec:** `docs/superpowers/specs/2026-09-01-opening-library-design.md`

## Global Constraints

- Production source of truth is `web/`; verify all production-facing work from that path.
- Cover the full ECO range A00-E99 without fabricating popularity, rating, win-rate, mastery, or performance metrics.
- Use permissively reusable factual opening data; do not copy copyrighted book/course prose, diagrams, annotations, or exercises.
- ChessIQ explanations must be original and position-specific.
- Keep the first-party C++ ChessEngine core; Stockfish must not replace it.
- Preserve ProductHeader skip-link/mobile behavior, Play piece motion, reduced-motion handling, and mobile square-board integrity.
- Each implementation task follows red-green-refactor TDD and ends in a focused commit.
- No production claim until GitHub CI passes and Vercel is verified to build the intended commit from `/vercel/path0/web`.

---

## File Structure

Create focused opening modules rather than growing `Learn.tsx` into a monolith:

```text
web/
  data/openings/
    source/openings.tsv
    generated/openings.json
    generated/opening-index.json
  scripts/build-openings.ts
  client/src/lib/openings/
    types.ts
    catalog.ts
    search.ts
    progress.ts
    lessons.ts
    training.ts
  client/src/components/openings/
    OpeningSearch.tsx
    OpeningTree.tsx
    OpeningBoard.tsx
    OpeningLessonPanel.tsx
    OpeningTrainer.tsx
  client/src/pages/
    Openings.tsx
    OpeningDetail.tsx
  client/src/openings.css
```

Modify `web/package.json`, `web/client/src/App.tsx`, `web/client/src/pages/Learn.tsx`, and only the minimum shared board/routing files needed to reuse existing legal-position logic.

---

### Task 1: Deterministic Opening Data Importer

**Files:**
- Create: `web/data/openings/source/openings.tsv`
- Create: `web/scripts/build-openings.ts`
- Create: `web/data/openings/generated/openings.json`
- Create: `web/data/openings/generated/opening-index.json`
- Create: `web/client/src/lib/openings/types.ts`
- Create: `web/client/src/openingsData.test.ts`
- Modify: `web/package.json`

**Interfaces:**
- Produces `OpeningRecord`, `OpeningIndexEntry`, `buildOpeningCatalog(sourceText)` and generated JSON artifacts.
- `OpeningRecord` fields: `id`, `eco`, `family`, `variationPath`, `fullName`, `pgn`, `uci`, `epd`, `parentId?`, `aliases`, `transpositionGroup?`.

- [ ] **Step 1: Write the failing data-contract test**

```ts
import openings from "../../data/openings/generated/openings.json";
import { describe, expect, it } from "vitest";

describe("generated opening catalog", () => {
  it("covers every ECO code from A00 through E99 with stable unique ids", () => {
    const ids = new Set(openings.map((o) => o.id));
    const ecos = new Set(openings.map((o) => o.eco));
    expect(ids.size).toBe(openings.length);
    expect([...ecos].filter((eco) => /^[A-E][0-9]{2}$/.test(eco)).length).toBe(500);
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `cd web && pnpm test -- openingsData.test.ts`

Expected: FAIL because generated data/modules do not exist.

- [ ] **Step 3: Define exact opening types and importer normalization**

`types.ts` must export:

```ts
export type OpeningRecord = {
  id: string;
  eco: string;
  family: string;
  variationPath: string[];
  fullName: string;
  pgn: string;
  uci: string[];
  epd: string;
  parentId?: string;
  aliases: string[];
  transpositionGroup?: string;
};

export type OpeningIndexEntry = Pick<OpeningRecord, "id" | "eco" | "family" | "fullName" | "aliases"> & {
  normalizedName: string;
};
```

Importer rules: reject ECO outside `/^[A-E][0-9]{2}$/`; parse colon-separated names into family/variation path; normalize whitespace; create deterministic slugs from ECO + normalized name + shortest distinguishing UCI prefix; reject duplicate ids; group equal normalized EPD positions into a deterministic `transpositionGroup`.

- [ ] **Step 4: Add the pinned CC0 source snapshot and generation script**

Add `build:openings` to `web/package.json`:

```json
"build:openings": "tsx scripts/build-openings.ts"
```

The script reads only the pinned source file and writes sorted deterministic JSON. It must not fetch the network during build or tests.

- [ ] **Step 5: Generate artifacts and verify GREEN**

Run:

```bash
cd web
pnpm run build:openings
pnpm test -- openingsData.test.ts
pnpm check
```

Expected: PASS; generated catalog contains all 500 ECO codes and unique stable ids.

- [ ] **Step 6: Commit**

```bash
git add web/data/openings web/scripts/build-openings.ts web/client/src/lib/openings/types.ts web/client/src/openingsData.test.ts web/package.json
git commit -m "feat: import complete ECO opening catalog"
```

---

### Task 2: Catalog, Search, Hierarchy, and Transpositions

**Files:**
- Create: `web/client/src/lib/openings/catalog.ts`
- Create: `web/client/src/lib/openings/search.ts`
- Create: `web/client/src/openingsCatalog.test.ts`

**Interfaces:**
- Consumes generated `OpeningRecord[]` and `OpeningIndexEntry[]`.
- Produces `getOpeningById(id)`, `getCanonicalOpening(eco, slug)`, `getOpeningTree()`, `searchOpenings(query, limit = 30)`, and `getTranspositions(openingId)`.

- [ ] **Step 1: Write failing search/hierarchy tests**

Test exact ECO ranking, family prefix ranking, normalized substring matching, a known move-sequence query, parent/child hierarchy, and same-position transposition grouping.

```ts
expect(searchOpenings("B90")[0]?.eco).toBe("B90");
expect(searchOpenings("sicilian")[0]?.family.toLowerCase()).toContain("sicilian");
expect(getTranspositions(knownId).every((x) => x.id !== knownId)).toBe(true);
```

- [ ] **Step 2: Run targeted tests and confirm RED**

Run: `cd web && pnpm test -- openingsCatalog.test.ts`

- [ ] **Step 3: Implement catalog APIs with deterministic sorting**

Ranking order must be: exact ECO → exact normalized name → prefix → alias → substring → move-sequence match. Default tree ordering is ECO then name; do not invent popularity ordering.

- [ ] **Step 4: Run tests, typecheck, and commit**

```bash
cd web
pnpm test -- openingsCatalog.test.ts
pnpm check
git add client/src/lib/openings client/src/openingsCatalog.test.ts
git commit -m "feat: add opening catalog search and hierarchy"
```

---

### Task 3: `/learn/openings` Explorer

**Files:**
- Create: `web/client/src/pages/Openings.tsx`
- Create: `web/client/src/components/openings/OpeningSearch.tsx`
- Create: `web/client/src/components/openings/OpeningTree.tsx`
- Create: `web/client/src/openings.css`
- Create: `web/client/src/openingsExplorer.test.ts`
- Modify: `web/client/src/App.tsx`
- Modify: `web/client/src/pages/Learn.tsx`
- Modify: `web/client/src/main.tsx`

**Interfaces:**
- Consumes `searchOpenings()` and `getOpeningTree()`.
- Produces directly addressable `/learn/openings` UI and links to `/learn/openings/:eco/:slug`.

- [ ] **Step 1: Add failing routing/UI contract tests**

Assert `App.tsx` registers `/learn/openings`; `Learn.tsx` exposes an Openings entry point; explorer has search, A-E ECO filters, semantic tree controls, and no fabricated “popular” stats.

- [ ] **Step 2: Run tests and confirm RED**

Run: `cd web && pnpm test -- openingsExplorer.test.ts`

- [ ] **Step 3: Build explorer UI**

Use the current premium navy/gold/cream identity. Tree nodes use buttons with `aria-expanded`; search has an explicit label; collapsed families do not render every descendant. Mobile layout stacks search/filter/tree without changing board-related global styles.

- [ ] **Step 4: Run focused + navigation regression tests**

```bash
cd web
pnpm test -- openingsExplorer.test.ts productNavigation.test.ts productRoutes.test.ts
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Openings.tsx client/src/components/openings client/src/openings.css client/src/App.tsx client/src/pages/Learn.tsx client/src/main.tsx client/src/openingsExplorer.test.ts
git commit -m "feat: add opening explorer"
```

---

### Task 4: Opening Detail Board, Move Timeline, and Analyze Handoff

**Files:**
- Create: `web/client/src/pages/OpeningDetail.tsx`
- Create: `web/client/src/components/openings/OpeningBoard.tsx`
- Create: `web/client/src/openingDetail.test.ts`
- Modify: `web/client/src/App.tsx`
- Modify: `web/client/src/openings.css`

**Interfaces:**
- Consumes `getCanonicalOpening()` and existing chess position/legal move utilities.
- Produces board replay controls and `/analyze?fen=<encoded-fen>` handoff for the currently displayed ply.

- [ ] **Step 1: Write failing detail-contract tests**

Cover canonical route resolution, not-found behavior, previous/next/start/end move controls, final position matching imported EPD/FEN semantics, breadcrumb hierarchy, and encoded Analyze link.

- [ ] **Step 2: Run and confirm RED**

Run: `cd web && pnpm test -- openingDetail.test.ts`

- [ ] **Step 3: Implement route and reusable board replay**

Replay the imported UCI line from the initial position using existing legal move helpers rather than introducing a second chess rules engine. Buttons expose `aria-label` values such as `Previous move`, `Next move`, `Go to start`, and `Go to end`.

- [ ] **Step 4: Verify detail behavior and board regressions**

```bash
cd web
pnpm test -- openingDetail.test.ts playPieceMotion.test.ts
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/OpeningDetail.tsx client/src/components/openings/OpeningBoard.tsx client/src/App.tsx client/src/openings.css client/src/openingDetail.test.ts
git commit -m "feat: add interactive opening detail board"
```

---

### Task 5: Original ChessIQ Teaching Layer

**Files:**
- Create: `web/client/src/lib/openings/lessons.ts`
- Create: `web/client/src/components/openings/OpeningLessonPanel.tsx`
- Create: `web/client/src/openingLessons.test.ts`
- Modify: `web/client/src/pages/OpeningDetail.tsx`

**Interfaces:**
- Produces `OpeningLesson`, `getOpeningLesson(openingId)`, and `getBaselineOpeningLesson(record)`.
- `OpeningLesson` contains overview, goals for White/Black, pawn structures, key squares, piece plans, pawn breaks, mistakes, tactical motifs, middlegame transitions, and checkpoints.

- [ ] **Step 1: Write failing content-schema tests**

Require every imported record to receive at least a truthful baseline generated from factual family/variation/move data, while curated major-family lessons override the baseline. Assert no empty section is rendered as invented prose.

- [ ] **Step 2: Run and confirm RED**

Run: `cd web && pnpm test -- openingLessons.test.ts`

- [ ] **Step 3: Implement baseline + curated family teaching**

Baseline wording must stay factual and conservative, e.g. identify opening family, shown line, side to move, and transition point. Add richer original lessons for major families across all five ECO volumes so each volume has meaningful teaching coverage from the first release.

- [ ] **Step 4: Render lesson sections in detail page and verify**

```bash
cd web
pnpm test -- openingLessons.test.ts openingDetail.test.ts
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/openings/lessons.ts client/src/components/openings/OpeningLessonPanel.tsx client/src/pages/OpeningDetail.tsx client/src/openingLessons.test.ts
git commit -m "feat: add ChessIQ opening teaching layer"
```

---

### Task 6: Opening-Specific Trainer and Persistent Progress

**Files:**
- Create: `web/client/src/lib/openings/training.ts`
- Create: `web/client/src/lib/openings/progress.ts`
- Create: `web/client/src/components/openings/OpeningTrainer.tsx`
- Create: `web/client/src/openingTraining.test.ts`
- Modify: `web/client/src/pages/OpeningDetail.tsx`
- Modify: `web/client/src/openings.css`

**Interfaces:**
- Produces `OpeningPrompt`, `buildOpeningPrompts(opening, lesson)`, `readOpeningProgress(storage)`, `recordOpeningAttempt(storage, attempt)`, and `nextOpeningPrompt(...)`.
- Storage key: `chessiq.openings.progress.v1`.

- [ ] **Step 1: Write failing prompt/progress tests**

Cover next-move recall, plan recognition, mistake avoidance when curated evidence exists, transposition recognition where multiple move orders exist, malformed localStorage fallback, and immediate next-prompt advancement after an answer.

- [ ] **Step 2: Run and confirm RED**

Run: `cd web && pnpm test -- openingTraining.test.ts`

- [ ] **Step 3: Implement prompt generation without fabricated refutations**

Generate next-move prompts directly from legal imported lines. Generate plan/mistake prompts only when the lesson explicitly provides alternatives/explanations. Generate transposition prompts only for verified transposition groups. Store attempts by opening id + theme with `correct`, `attemptedAt`, and prompt id; do not calculate fake ratings.

- [ ] **Step 4: Build trainer UI and verify persistence**

The interaction is `answer → explanation → next puzzle`, with keyboard-operable choices and a board for move-recall prompts.

Run:

```bash
cd web
pnpm test -- openingTraining.test.ts openingLessons.test.ts
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/openings/training.ts client/src/lib/openings/progress.ts client/src/components/openings/OpeningTrainer.tsx client/src/pages/OpeningDetail.tsx client/src/openings.css client/src/openingTraining.test.ts
git commit -m "feat: add opening trainer and progress"
```

---

### Task 7: Full Validation, Accessibility, Performance, and Production Readiness

**Files:**
- Modify tests only where verified behavior requires tolerant contract matching.
- Modify opening modules only for defects found by verification.

**Interfaces:**
- Consumes the completed opening subsystem.
- Produces a release candidate suitable for PR review and later Vercel verification.

- [ ] **Step 1: Run all frontend tests**

Run: `cd web && pnpm test`

Expected: all tests PASS.

- [ ] **Step 2: Run TypeScript and production build**

```bash
cd web
pnpm check
pnpm run build:vercel
```

Expected: TypeScript PASS; first-party C++ ChessEngine compiles with g++; Vite production build PASS.

- [ ] **Step 3: Verify generated-data determinism**

```bash
cd web
cp data/openings/generated/openings.json /tmp/openings.before.json
pnpm run build:openings
diff -u /tmp/openings.before.json data/openings/generated/openings.json
```

Expected: no diff.

- [ ] **Step 4: Perform manual accessibility/responsive smoke checks**

Verify `/learn/openings` and at least one detail route at desktop and narrow mobile widths: keyboard search/tree navigation, visible focus, readable hierarchy, square board, no horizontal overflow, reduced-motion respected, Analyze handoff preserves current position.

- [ ] **Step 5: Commit verification fixes only if needed**

```bash
git add web
git commit -m "fix: harden opening library release"
```

Skip the commit if verification required no changes.

- [ ] **Step 6: Open PR and verify CI before any merge request**

The PR description must state the CC0 factual source, original-content policy, exact test/build commands, and that Stockfish did not replace ChessEngine. Do not claim production live until a post-merge Vercel deployment is READY on the exact merge SHA and logs show `/vercel/path0/web` plus `build:engine:vercel`.
