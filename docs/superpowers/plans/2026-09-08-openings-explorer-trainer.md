# ChessIQ Openings Explorer + Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-grade ECO A00-E99 Openings Explorer and interactive spaced-repetition opening trainer to the existing ChessIQ full-stack application under `app/`.

**Architecture:** Keep the existing React/Vite + Wouter client, tRPC server boundary, Drizzle/MySQL persistence, authentication, and chess.js legality model. Vendor a distilled CC0 canonical opening catalog derived from `lichess-org/chess-openings` into `app/shared/openings/`; use Lichess Opening Explorer only for live statistics behind a validated server-side cache. Trainer correctness is always determined by the local canonical repertoire plus chess.js legality.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Wouter, tRPC 11, Drizzle ORM/MySQL, chess.js 1.4, Framer Motion 12, Vitest, existing ChessIQ UI/CSS system.

**Spec:** `docs/superpowers/specs/2026-09-08-openings-explorer-trainer-design.md`

## Global Constraints

- Production source of truth is `app/`; `web/` is reference-only.
- Do not migrate to Next.js, Prisma, PostgreSQL, Zustand, or Jotai.
- Do not introduce a second router, frontend app, database layer, or direct browser call to Lichess.
- `chess.js` remains the browser-side legal move authority.
- Canonical opening identity, names, move lines, trainer lines, and explanations are local and do not depend on an external API.
- Lichess Opening Explorer is statistical enrichment only and must fail soft.
- Phase 1 release gate includes every ECO code from A00 through E99.
- All authenticated review/progress data is scoped by `ctx.user.id`.
- Mobile is board-first; reduced motion and keyboard accessibility remain release gates.
- Existing TypeScript, Vitest, accessibility, and C++ engine CI must remain green.

---

### Task 1: Canonical ECO Catalog and Validation

**Files:**
- Create: `app/shared/openings/types.ts`
- Create: `app/shared/openings/ecoCatalog.ts`
- Create: `app/shared/openings/search.ts`
- Create: `app/shared/openings/validation.ts`
- Create: `app/shared/openings/README.md`
- Create: `app/shared/openings/ecoCatalog.test.ts`

**Interfaces:**
- Produces `OpeningNode`, `OpeningCatalog`, `getOpeningBySlug`, `getOpeningById`, `getOpeningsByEco`, `searchOpenings`, `validateOpeningCatalog`.
- `OpeningNode.uci` is a complete UCI move sequence from the initial position; `epd` is the normalized opening position; `parentId` is either another node id or `null`.

- [ ] **Step 1: Write failing catalog integrity tests**

```ts
import { describe, expect, it } from "vitest";
import { ECO_CATALOG } from "./ecoCatalog";
import { validateOpeningCatalog } from "./validation";

it("covers every ECO code A00 through E99", () => {
  const covered = new Set(ECO_CATALOG.map(node => node.eco));
  for (const volume of ["A", "B", "C", "D", "E"] as const) {
    for (let n = 0; n < 100; n++) expect(covered.has(`${volume}${String(n).padStart(2, "0")}`)).toBe(true);
  }
});

it("contains only legal opening lines", () => {
  expect(validateOpeningCatalog(ECO_CATALOG)).toEqual([]);
});
```

- [ ] **Step 2: Verify tests fail before implementation**

Run: `cd app && pnpm vitest run shared/openings/ecoCatalog.test.ts`
Expected: FAIL because the shared opening modules do not exist.

- [ ] **Step 3: Define canonical types and helpers**

```ts
export type OpeningNode = {
  id: string;
  slug: string;
  eco: string;
  name: string;
  aliases: string[];
  pgn: string;
  uci: string[];
  epd: string;
  parentId: string | null;
  depth: number;
  summary?: string;
  ideasWhite?: string[];
  ideasBlack?: string[];
  trainable: boolean;
  acceptableContinuations: string[];
};

export type OpeningCatalog = readonly OpeningNode[];
```

- [ ] **Step 4: Vendor a distilled CC0 catalog**

Use `lichess-org/chess-openings` as the factual opening-name/move source. Preserve an attribution note in `app/shared/openings/README.md` identifying the CC0 source and the date of the imported snapshot. Store only fields ChessIQ needs at runtime. Ensure all 500 ECO codes have at least one real named node and include named major/minor variations available in the imported data.

- [ ] **Step 5: Implement legality/relationship validation**

Use `Chess` from `chess.js` to replay every UCI sequence. Reject duplicate ids/slugs, invalid ECO codes, missing parents, child lines that do not extend their parent line, illegal moves, and illegal acceptable continuations.

- [ ] **Step 6: Implement normalized search**

`searchOpenings(query)` must index opening name, aliases, ECO, PGN text, and normalized UCI sequence; empty query returns top-level/root candidates rather than throwing.

- [ ] **Step 7: Run catalog tests**

Run: `cd app && pnpm vitest run shared/openings/ecoCatalog.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/shared/openings
git commit -m "feat: add canonical ECO opening catalog"
```

---

### Task 2: Opening Review Persistence and Deterministic SRS

**Files:**
- Modify: `app/drizzle/schema.ts`
- Modify: `app/server/db.ts`
- Create: `app/shared/openings/srs.ts`
- Create: `app/shared/openings/srs.test.ts`
- Create: `app/drizzle/0001_opening_learning.sql` (or next generated migration filename)

**Interfaces:**
- Produces `scheduleOpeningReview(state, rating, reviewedAt)`, `calculateOpeningMastery(items)`, `recordOpeningAttempt`, `upsertOpeningReviewItem`, `listOpeningReviewItemsForUser`, `listOpeningAttemptsForUser`.

- [ ] **Step 1: Write failing SRS tests**

```ts
it("schedules Again sooner than Good", () => {
  const now = new Date("2026-09-08T00:00:00Z");
  const again = scheduleOpeningReview(undefined, "again", now);
  const good = scheduleOpeningReview(undefined, "good", now);
  expect(again.dueAt.getTime()).toBeLessThan(good.dueAt.getTime());
});

it("mastery penalizes overdue weak items", () => {
  const score = calculateOpeningMastery([{ accuracy: 0.4, overdueDays: 9, intervalDays: 1, criticalWeight: 1.5 }]);
  expect(score.state).toBe("weak");
});
```

- [ ] **Step 2: Verify tests fail**

Run: `cd app && pnpm vitest run shared/openings/srs.test.ts`
Expected: FAIL because scheduler functions do not exist.

- [ ] **Step 3: Add dedicated schema**

Add `openingReviewItems` keyed by `(userId, openingNodeId, side)` with `ease`, `intervalDays`, `dueAt`, `streak`, `lapses`, `lastResult`, `lastReviewedAt`, timestamps. Add `openingAttempts` with user, node, side, result, response time, hint usage, rating, and createdAt. Add indexes on `(userId, dueAt)` and `(userId, createdAt)`.

- [ ] **Step 4: Implement pure deterministic scheduler**

Use four ratings (`again`, `hard`, `good`, `easy`). Keep the algorithm deterministic and conservative: Again resets interval to 1 day and increments lapses; Hard grows slowly; Good grows from current interval using ease; Easy grows more aggressively and raises ease. Clamp ease to a safe bounded range.

- [ ] **Step 5: Implement mastery pure function**

Return `{ score: number; state: "new" | "learning" | "weak" | "solid" | "mastered" }` from coverage/accuracy/retention/overdue/critical weighting. Keep the function side-effect-free.

- [ ] **Step 6: Add per-user DB accessors**

Every query must accept an explicit `userId`; no accessor may return another user's rows.

- [ ] **Step 7: Run focused tests and migration generation/check**

Run: `cd app && pnpm vitest run shared/openings/srs.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/drizzle app/server/db.ts app/shared/openings/srs*
git commit -m "feat: persist opening reviews and SRS state"
```

---

### Task 3: tRPC Openings API and Lichess Statistics Cache

**Files:**
- Modify: `app/server/routers.ts`
- Create: `app/server/openingsStats.ts`
- Create: `app/server/openingsStats.test.ts`
- Create: `app/drizzle/openingStatsCache` schema entries in `app/drizzle/schema.ts`
- Modify: `app/server/db.ts`

**Interfaces:**
- Produces tRPC procedures `openings.search`, `openings.detail`, `openings.stats`, `openings.progress`, `openings.queue`, `openings.recordAttempt`.
- `openings.stats` returns `{ status: "live" | "stale" | "unavailable"; moves: Array<{ uci; san; games; white; draws; black }> }`.

- [ ] **Step 1: Write failing cache/proxy tests**

Cover valid live payload, malformed payload rejection, timeout fallback to stale DB cache, and explicit unavailable result when neither live nor stale exists.

- [ ] **Step 2: Verify tests fail**

Run: `cd app && pnpm vitest run server/openingsStats.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement persistent cache**

Normalize FEN/EPD position identity by ignoring halfmove/fullmove counters while preserving board, side, castling, and legal en-passant semantics. Persist validated result JSON plus fetched timestamp.

- [ ] **Step 4: Implement external fetch boundary**

Call Lichess Opening Explorer server-side with a bounded timeout using `AbortController`. Validate every numeric field and move shape before caching or returning it. Never fabricate percentages.

- [ ] **Step 5: Add tRPC openings router**

Public: search/detail/stats. Protected: progress/queue/recordAttempt. Protected handlers scope every DB call to `ctx.user.id` and run canonical move validation before accepting trainer evidence.

- [ ] **Step 6: Run focused tests**

Run: `cd app && pnpm vitest run server/openingsStats.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/server app/drizzle/schema.ts
git commit -m "feat: add openings API and resilient live stats"
```

---

### Task 4: Product Navigation and Premium Openings Explorer

**Files:**
- Modify: `app/client/src/App.tsx`
- Modify: `app/client/src/lib/productNavigation.ts`
- Create: `app/client/src/pages/OpeningsPage.tsx`
- Create: `app/client/src/pages/OpeningDetailPage.tsx`
- Create: `app/client/src/components/openings/OpeningTree.tsx`
- Create: `app/client/src/components/openings/OpeningSearch.tsx`
- Create: `app/client/src/components/openings/OpeningStatsPanel.tsx`
- Create: `app/client/src/components/openings/OpeningBoardWorkspace.tsx`
- Create: `app/client/src/openings-premium.css`
- Create: `app/client/src/openingsExplorerContract.test.ts`

**Interfaces:**
- Explorer consumes canonical catalog/search helpers and `trpc.openings.stats`.
- `OpeningBoardWorkspace` accepts an `OpeningNode`, active ply, orientation, and navigation callbacks.

- [ ] **Step 1: Write failing route/navigation/contract tests**

Assert `/openings` and `/openings/:slug` routes exist, `Openings` appears in product navigation, mobile CSS collapses the desktop three-column workspace, and a `Train this line` action is rendered from opening detail.

- [ ] **Step 2: Verify tests fail**

Run: `cd app && pnpm vitest run client/src/openingsExplorerContract.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add routes and navigation**

Register `OpeningsPage` and `OpeningDetailPage`, preserve existing routes, and add `Openings` to the product header navigation.

- [ ] **Step 4: Implement Explorer**

Desktop: searchable tree, dominant board/move timeline, stats/ideas panel. Mobile: opening identity -> board -> controls -> tabbed/sheet tree/stats -> thumb-reachable train action. Search deep-links to exact nodes.

- [ ] **Step 5: Implement accessible tree and board controls**

Tree rows are keyboard focusable and use `aria-expanded` where applicable. Previous/next/first/last controls have labels. Respect `prefers-reduced-motion`.

- [ ] **Step 6: Run focused tests and TypeScript**

Run: `cd app && pnpm vitest run client/src/openingsExplorerContract.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/client/src
git commit -m "feat: add premium openings explorer"
```

---

### Task 5: Interactive Opening Trainer

**Files:**
- Create: `app/client/src/pages/OpeningTrainerPage.tsx`
- Create: `app/client/src/components/openings/TrainerFeedback.tsx`
- Create: `app/client/src/components/openings/TrainerSessionRail.tsx`
- Create: `app/client/src/lib/openings/trainer.ts`
- Create: `app/client/src/lib/openings/trainer.test.ts`
- Modify: `app/client/src/App.tsx`
- Modify: `app/client/src/openings-premium.css`

**Interfaces:**
- Produces `evaluateTrainerMove(node, uci)` -> `{ kind: "correct" | "acceptable" | "wrong" | "illegal"; canonicalMove?: string }`.
- Produces deterministic session queue ordering from SRS due items and selected opening/side.

- [ ] **Step 1: Write failing trainer logic tests**

Cover canonical correct move, accepted canonical alternative, legal but non-repertoire wrong move, illegal move, White/Black side behavior, and deterministic queue priority.

- [ ] **Step 2: Verify tests fail**

Run: `cd app && pnpm vitest run client/src/lib/openings/trainer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement trainer logic**

Replay the active position with chess.js, reject illegal moves first, then compare UCI against canonical acceptable continuations. Do not use live statistics or engine evaluation to decide correctness.

- [ ] **Step 4: Implement trainer page modes**

Support `learn`, `recall`, and `mixed`. Support White/Black repertoire orientation. After an answer show simple explanation, canonical move arrow/highlight, and Again/Hard/Good/Easy controls. Guests train locally; authenticated users persist attempt/review state.

- [ ] **Step 5: Implement sync failure behavior**

A failed save keeps the session playable and shows a non-destructive `Not synced` state; do not discard local queue or board state.

- [ ] **Step 6: Run focused tests and TypeScript**

Run: `cd app && pnpm vitest run client/src/lib/openings/trainer.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/client/src
git commit -m "feat: add interactive opening trainer"
```

---

### Task 6: Opening Progress Integration

**Files:**
- Modify: `app/client/src/pages/ProgressPage.tsx`
- Create: `app/client/src/components/openings/OpeningProgressSection.tsx`
- Create: `app/client/src/openingProgressContract.test.ts`

**Interfaces:**
- Consumes `trpc.openings.progress` and routes `Continue training` into `/trainer?mode=mixed`.

- [ ] **Step 1: Write failing progress contract tests**

Assert the Progress surface includes White repertoire, Black repertoire, due review count, weakest branches, mastery states, and Continue training action.

- [ ] **Step 2: Verify tests fail**

Run: `cd app && pnpm vitest run client/src/openingProgressContract.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement opening progress section**

Render concise cards for White/Black repertoire, due count, recent accuracy, weakest lines, and mastery. Hide trend claims when insufficient evidence exists.

- [ ] **Step 4: Run focused tests and TypeScript**

Run: `cd app && pnpm vitest run client/src/openingProgressContract.test.ts && pnpm check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/client/src/pages/ProgressPage.tsx app/client/src/components/openings app/client/src/openingProgressContract.test.ts
git commit -m "feat: integrate opening mastery into progress"
```

---

### Task 7: Full Quality Gate and Documentation

**Files:**
- Modify: `README.md`
- Modify/Create: `app/docs/CHESSIQ_FUNCTIONAL_VALIDATION.md`
- Verify: all files changed above

**Interfaces:** None; this task validates the integrated product.

- [ ] **Step 1: Document the feature and data provenance**

Document Openings Explorer/Trainer routes, local canonical data behavior, CC0 attribution, live stats failure behavior, and SRS persistence.

- [ ] **Step 2: Run the complete app test suite**

Run: `cd app && pnpm test`
Expected: PASS.

- [ ] **Step 3: Run TypeScript**

Run: `cd app && pnpm check`
Expected: PASS.

- [ ] **Step 4: Run accessibility verification**

Run: `cd app && pnpm test:accessibility`
Expected: PASS.

- [ ] **Step 5: Run production build**

Run: `cd app && pnpm build`
Expected: PASS.

- [ ] **Step 6: Confirm existing root C++ quality gate is unaffected**

Use the repository's existing CI/workflow checks; do not alter C++ engine behavior as part of this feature.

- [ ] **Step 7: Commit docs/verification adjustments**

```bash
git add README.md app/docs
git commit -m "docs: validate ChessIQ openings training platform"
```

- [ ] **Step 8: Open PR and require green CI before merge**

Create a PR from `feature/openings-explorer-trainer` to `main`. Verify all workflow checks against the PR head SHA. Merge only when required checks are green and no unresolved review blocker exists.
