# ChessIQ Premium Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first premium ChessIQ frontend increment: correct frontend CI, a unified product shell, a board-first Play workspace, and a flagship Analyze workspace without breaking existing ChessEngine-backed flows.

**Architecture:** Keep the existing React/Vite/tRPC structure. Concentrate navigation in `ProductHeader`, keep Play and Analyze data mutations unchanged, and use CSS/layout composition to upgrade presentation. Reuse existing review/evaluation components only where they can consume real saved-game/analysis state safely.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Wouter, tRPC, chess.js, Vitest, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-31-chessiq-premium-frontend-design.md`

## Global Constraints

- Preserve existing working game, analysis, authentication, and engine flows.
- Keep the first-party C++ ChessEngine as the core engine.
- Remove production-facing placeholder copy from upgraded Play and Analyze primary surfaces.
- Dark and light themes remain supported.
- Mobile is a first-class layout, not a squeezed desktop layout.
- Do not copy Chess.com or Lichess branding or visual identity.

---

### Task 1: Make frontend CI verify the real Vercel app

**Files:**
- Modify: `.github/workflows/frontend.yml`

**Interfaces:**
- Consumes: `app/package.json` scripts `test`, `check`, `build:vercel`, `test:accessibility`.
- Produces: CI coverage for all `app/**` frontend changes.

- [ ] **Step 1: Verify the current workflow is wrong**

Inspect `.github/workflows/frontend.yml` and confirm it watches `web/**`, uses `working-directory: web`, and caches `web/pnpm-lock.yaml` while Vercel is linked to the repository's `app` Vite application.

- [ ] **Step 2: Update the workflow**

Use these paths/settings:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "app/**"
      - ".github/workflows/frontend.yml"
  pull_request:
    branches: [main]
    paths:
      - "app/**"
      - ".github/workflows/frontend.yml"

jobs:
  app:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: app
```

Set `cache-dependency-path: app/pnpm-lock.yaml`. Run `pnpm test`, `pnpm run check`, `pnpm run test:accessibility`, and `pnpm run build:vercel`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/frontend.yml
git commit -m "ci: verify ChessIQ app frontend"
```

### Task 2: Define and test the product navigation contract

**Files:**
- Create: `app/client/src/lib/productNavigation.ts`
- Create: `app/client/src/lib/productNavigation.test.ts`
- Modify: `app/client/src/components/ProductHeader.tsx`

**Interfaces:**
- Produces: `productRoutes: readonly ProductRoute[]` where `ProductRoute = { href: string; label: string }`.
- Consumes: Wouter `Link` and `useLocation`.

- [ ] **Step 1: Write the failing navigation test**

```ts
import { describe, expect, it } from "vitest";
import { productRoutes } from "./productNavigation";

describe("productRoutes", () => {
  it("keeps the ChessIQ primary navigation in product order", () => {
    expect(productRoutes).toEqual([
      { href: "/play", label: "Play" },
      { href: "/analyze", label: "Analyze" },
      { href: "/puzzles", label: "Puzzles" },
      { href: "/learn", label: "Learn" },
      { href: "/games", label: "Games" },
      { href: "/progress", label: "Progress" },
      { href: "/coach", label: "Coach" },
    ]);
  });
});
```

- [ ] **Step 2: Run it and verify RED**

```bash
cd app && pnpm test client/src/lib/productNavigation.test.ts
```

Expected: FAIL because `productNavigation` does not exist yet.

- [ ] **Step 3: Implement the minimal route module**

```ts
export type ProductRoute = { href: string; label: string };

export const productRoutes = [
  { href: "/play", label: "Play" },
  { href: "/analyze", label: "Analyze" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/learn", label: "Learn" },
  { href: "/games", label: "Games" },
  { href: "/progress", label: "Progress" },
  { href: "/coach", label: "Coach" },
] as const satisfies readonly ProductRoute[];
```

- [ ] **Step 4: Make `ProductHeader` consume `productRoutes` and expose `aria-current="page"` on the active link**

Keep theme and auth actions unchanged.

- [ ] **Step 5: Run tests/check**

```bash
cd app && pnpm test client/src/lib/productNavigation.test.ts && pnpm run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/client/src/lib/productNavigation.ts app/client/src/lib/productNavigation.test.ts app/client/src/components/ProductHeader.tsx
git commit -m "feat: unify ChessIQ product navigation"
```

### Task 3: Redesign Play around the board

**Files:**
- Modify: `app/client/src/pages/PlayPage.tsx`
- Modify: `app/client/src/index.css`

**Interfaces:**
- Preserve: `trpc.games.list`, `trpc.games.create`, `trpc.games.move`, `gameSummary`, `PlayableChessBoard`.
- Produce: board-first desktop and mobile Play layout.

- [ ] **Step 1: Add a failing static UI contract test**

Extend `productNavigation.test.ts` with a source-contract test using Node `fs` that asserts Play no longer contains the long marketing sentence `Play a legal game. Keep every position.` and does contain the concise status labels `New game` and `Recent games`.

- [ ] **Step 2: Run the test and verify RED**

```bash
cd app && pnpm test client/src/lib/productNavigation.test.ts
```

Expected: FAIL on the old Play heading.

- [ ] **Step 3: Rewrite Play presentation only**

Keep all mutations intact. Use:

```tsx
<section className="product-page play-page">
  <header className="page-commandbar">...</header>
  <div className="play-cockpit">
    <section className="board-cockpit">...</section>
    <aside className="play-control-rail">...</aside>
  </div>
</section>
```

The board remains the visual priority. Move side-to-move/status close to the board. Keep Local board and Play ChessEngine actions and the existing recent game list.

- [ ] **Step 4: Add responsive CSS**

Desktop: board + rail. Tablet/mobile: single column, board first, no horizontal overflow, touch-friendly buttons.

- [ ] **Step 5: Run tests/check/build**

```bash
cd app && pnpm test && pnpm run check && pnpm run build:vercel
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/client/src/pages/PlayPage.tsx app/client/src/index.css app/client/src/lib/productNavigation.test.ts
git commit -m "feat: make Play board-first"
```

### Task 4: Upgrade Analyze into the flagship workspace

**Files:**
- Modify: `app/client/src/pages/AnalyzePage.tsx`
- Modify: `app/client/src/index.css`
- Reuse where compatible: `app/client/src/components/EvaluationBar.tsx`, `EvaluationGraph.tsx`, `ClassificationBadge.tsx`, `CriticalMoments.tsx`, `AnalysisPanel.tsx`, `AnalysisThread.tsx`.

**Interfaces:**
- Preserve: `trpc.analysis.list`, `trpc.analysis.analyze`, `trpc.games.importPgn`, saved-game selection.
- Produce: board + engine insight rail + integrated PGN import.

- [ ] **Step 1: Add a failing static UI contract test**

Assert `AnalyzePage.tsx` no longer contains `Ask the engine about a real saved position.` and does contain `Engine analysis`, `Import PGN`, and `Your games`.

- [ ] **Step 2: Run and verify RED**

```bash
cd app && pnpm test client/src/lib/productNavigation.test.ts
```

Expected: FAIL on old Analyze copy/layout contract.

- [ ] **Step 3: Recompose Analyze presentation**

Use a board-first grid:

```tsx
<div className="analysis-cockpit">
  <section className="analysis-board-stage">...</section>
  <aside className="analysis-insight-rail">...</aside>
</div>
```

Keep the real ChessEngine mutation as the source of engine results. Show latest score/depth/PV prominently. Keep saved sessions and saved-game switching. Integrate PGN import into the same rail/workflow hierarchy.

- [ ] **Step 4: Add deliberate states**

Signed out, no game, analyzing, no sessions, engine sessions available, import pending, and mutation error should remain understandable without placeholder copy.

- [ ] **Step 5: Add responsive CSS**

Desktop: board + insight rail. Tablet/mobile: board first, rail below, controls stack without overflow.

- [ ] **Step 6: Run complete frontend verification**

```bash
cd app && pnpm test && pnpm run check && pnpm run test:accessibility && pnpm run build:vercel
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/client/src/pages/AnalyzePage.tsx app/client/src/index.css app/client/src/lib/productNavigation.test.ts
git commit -m "feat: build flagship ChessIQ analysis workspace"
```

### Task 5: Preview, visual QA, and promotion gate

**Files:**
- No production file required unless QA finds a defect.

**Interfaces:**
- Consumes: Vercel branch preview generated from `frontend-premium-shell`.
- Produces: evidence that the branch is ready for merge.

- [ ] **Step 1: Confirm Vercel preview is READY**

Use the branch alias `chessiq-git-frontend-premium-shell-miim.vercel.app` or the latest deployment for the branch.

- [ ] **Step 2: Check `/play` and `/analyze` visually**

Desktop and mobile viewport checks must confirm board-first hierarchy, readable controls, no horizontal overflow, active navigation, theme support, and no obvious placeholder/pending copy.

- [ ] **Step 3: Inspect Vercel build/runtime errors**

There must be no new build failure and no new critical runtime error attributable to the frontend change.

- [ ] **Step 4: Open a PR to `main`**

Summarize scope, checks, preview URL, and any deferred follow-ups. Merge/promotion happens only after verification.
