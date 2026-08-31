# ChessIQ Functional Web Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Vercel-served `web/` frontend from a visual preview into a no-login ChessIQ product with real Play, Analyze, Learn, and Puzzles routes backed by the first-party C++ ChessEngine where chess legality or analysis is required.

**Architecture:** Keep `web/` as the current Vercel production source. Reuse the branch's partially implemented `/api/play` and `/api/analyze` Vercel Functions and extend the C++ UCI-like command surface for deterministic legal-move/status data. Centralize navigation, make Play and Puzzles consume a shared interactive legal-board layer, replace the sample-only Analyze flow with user-loadable FEN analysis, and keep Learn/Puzzle progress browser-local for this milestone.

**Tech Stack:** React 19, TypeScript 5.6, Wouter, Vite 7, Vitest, Vercel Functions, C++20 ChessEngine, localStorage.

**Spec:** `docs/superpowers/specs/2026-08-31-functional-web-platform-design.md`

## Global Constraints

- Production source of truth remains `web/` for this milestone.
- The first-party C++ ChessEngine remains the analysis engine.
- No authentication or database is required for this milestone.
- Implement real `/play`, `/analyze`, `/learn`, `/puzzles`; `/review` aliases Analyze.
- Play must support legal local moves, New Game, Undo, Reset, queen auto-promotion, move history, and game status.
- Analyze must accept a FEN, validate it through the live API path, and show real best move, evaluation, depth, PV, and engine name.
- Learn and Puzzles completion persist in `localStorage`.
- Phone layouts are single-column; no production-facing `coming next`, `local development sample`, or fake-success copy remains on implemented surfaces.
- Engine errors and timeouts must surface as real errors; never fabricate engine output.
- Implementation variance approved at plan review: because `functional-web-platform` already contains a first-party `/api/play` implementation plus `legalmoves`/`play` ChessEngine commands, use the C++ engine as the legal-move authority instead of introducing `chess.js` into `web/`. This preserves all user-visible spec behavior while keeping ChessEngine central and avoids dependency/lockfile churn.

---

### Task 1: Centralize Real Product Routing and Navigation

**Files:**
- Create: `web/client/src/components/ProductHeader.tsx`
- Create: `web/client/src/lib/productRoutes.ts`
- Create: `web/client/src/productRoutes.test.ts`
- Modify: `web/client/src/App.tsx`
- Modify: `web/client/src/pages/Home.tsx`
- Modify: `web/client/src/pages/Play.tsx`
- Modify: `web/client/src/pages/Learn.tsx`
- Modify: `web/client/src/pages/Puzzles.tsx`

**Interfaces:**
- Produces: `productRoutes: ReadonlyArray<{ href: "/play" | "/analyze" | "/learn" | "/puzzles"; label: string }>`.
- Produces: `<ProductHeader activePath={...} />`, used by every public product route.
- Router contract: `/` -> Play, `/play` -> Play, `/analyze` -> Analyze, `/review` -> Analyze, `/learn` -> Learn, `/puzzles` -> Puzzles.

- [ ] **Step 1: Write the failing route/navigation contract**

Create `web/client/src/productRoutes.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productRoutes";

describe("ChessIQ public product routing", () => {
  it("exposes four real product destinations", () => {
    expect(productRoutes).toEqual([
      { href: "/play", label: "Play" },
      { href: "/analyze", label: "Analyze" },
      { href: "/learn", label: "Learn" },
      { href: "/puzzles", label: "Puzzles" },
    ]);
  });

  it("keeps preview-only navigation copy out of product pages", () => {
    const files = ["pages/Home.tsx", "pages/Play.tsx", "pages/Learn.tsx", "pages/Puzzles.tsx"];
    for (const file of files) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/coming next|next production surface|is-disabled/);
    }
  });

  it("aliases review to Analyze and makes Play the root product route", () => {
    const source = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    expect(source).toContain('<Route path="/" component={Play} />');
    expect(source).toContain('<Route path="/review" component={Analyze} />');
  });
});
```

- [ ] **Step 2: Run the contract and verify RED**

Run from `web/`:

```bash
pnpm vitest run client/src/productRoutes.test.ts
```

Expected: FAIL because `lib/productRoutes.ts` and the shared `ProductHeader` do not yet exist, root still points at Home, `/review` is absent, and Learn/Puzzles still contain disabled/placeholder Play navigation.

- [ ] **Step 3: Implement routes and shared header**

Create `web/client/src/lib/productRoutes.ts`:

```ts
export const productRoutes = [
  { href: "/play", label: "Play" },
  { href: "/analyze", label: "Analyze" },
  { href: "/learn", label: "Learn" },
  { href: "/puzzles", label: "Puzzles" },
] as const;
```

Create `web/client/src/components/ProductHeader.tsx` using `BrandMark`, `Link`, `useTheme`, and `productRoutes`. It must render links, never buttons/toasts, mark the matching route with `aria-current="page"`, and keep the existing Light/Dark control.

Update `App.tsx` to import the analysis page as `Analyze`, set `/` to `Play`, add `/review` -> `Analyze`, and keep NotFound fallback. Replace duplicated page headers in Home/Play/Learn/Puzzles with `<ProductHeader activePath="..." />`.

- [ ] **Step 4: Run the focused test**

```bash
pnpm vitest run client/src/productRoutes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run production-web typecheck/build**

```bash
pnpm check
pnpm run build:vercel
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add web/client/src/App.tsx web/client/src/components/ProductHeader.tsx web/client/src/lib/productRoutes.ts web/client/src/productRoutes.test.ts web/client/src/pages/{Home,Play,Learn,Puzzles}.tsx
git commit -m "feat: make ChessIQ product navigation real"
```

---

### Task 2: Make Play a Complete Legal Local Game

**Files:**
- Create: `web/client/src/engine/playState.ts`
- Create: `web/client/src/engine/playState.test.ts`
- Create: `web/client/src/components/LegalChessBoard.tsx`
- Modify: `web/client/src/engine/playEngine.ts`
- Modify: `web/api/play.ts`
- Modify: `app/engine/src/main.cpp`
- Modify: `web/client/src/pages/Play.tsx`
- Modify: `web/client/src/play.css`

**Interfaces:**
- `PlayEngineState = { fen: string; legalMoves: string[]; status: "ongoing" | "check" | "checkmate" | "stalemate" | "draw"; engine: string }`.
- `fetchLegalMoves(fen: string): Promise<PlayEngineState>`.
- `playMove(fen: string, move: string): Promise<PlayEngineState>`.
- `<LegalChessBoard fen legalMoves disabled onMove />` calls `onMove(uci)` only for a currently legal UCI move and auto-promotes a pawn reaching rank 1/8 to queen.

- [ ] **Step 1: Write failing state/status tests**

Create `web/client/src/engine/playState.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { moveTargets, sideToMove, statusLabel } from "./playState";

describe("public play state", () => {
  it("maps legal UCI moves to selected-square targets", () => {
    expect(moveTargets(["e2e4", "e2e3", "g1f3"], "e2")).toEqual(["e4", "e3"]);
  });

  it("reads side to move from FEN", () => {
    expect(sideToMove("8/8/8/8/8/8/8/8 b - - 0 1")).toBe("black");
  });

  it("renders terminal engine status without pretending it is merely a turn", () => {
    expect(statusLabel("checkmate", "white")).toBe("Checkmate");
    expect(statusLabel("stalemate", "black")).toBe("Stalemate");
    expect(statusLabel("check", "white")).toBe("White to move · Check");
  });
});
```

Add a source contract asserting `web/api/play.ts` returns a `status` field and `app/engine/src/main.cpp` supports a `status` command.

- [ ] **Step 2: Verify RED**

```bash
pnpm vitest run client/src/engine/playState.test.ts client/src/playWorkspaceContract.test.ts
```

Expected: FAIL because status helpers/API status are absent.

- [ ] **Step 3: Add a deterministic engine status command**

In `app/engine/src/main.cpp`, add a helper that maps `gameStatus(GameState(position))` to stable tokens:

```cpp
std::string statusToken(const Position& position) {
    GameState state(position);
    switch (gameStatus(state)) {
        case GameStatus::Checkmate: return "checkmate";
        case GameStatus::Stalemate: return "stalemate";
        case GameStatus::FiftyMoveDraw:
        case GameStatus::ThreefoldRepetition:
        case GameStatus::InsufficientMaterial: return "draw";
        case GameStatus::Ongoing: return isInCheck(position) ? "check" : "ongoing";
    }
    return "ongoing";
}
```

Handle command `status` with `std::cout << "status " << statusToken(position) << '\n'`.

Update `web/api/play.ts` to issue `legalmoves`, `status`, `quit`, parse the final `status <token>` line, and return the typed status.

- [ ] **Step 4: Add focused state helpers and shared board**

Create `playState.ts` with pure `decodeFen`, `sideToMove`, `moveTargets`, `statusLabel`, and `promotionUci(from,to,piece)` helpers. Extract the existing clickable board from Play into `LegalChessBoard.tsx`; it consumes server-provided legal moves, never hard-coded targets.

- [ ] **Step 5: Finish Play behavior**

Update `Play.tsx` to use `LegalChessBoard`. Keep initial start position. `New game` resets FEN/history/move list. `Undo` restores prior FEN and then reloads legal/status state. Rename any duplicate reset action consistently. Render engine status from the API. Keep queen auto-promotion.

- [ ] **Step 6: Verify focused tests**

```bash
pnpm vitest run client/src/engine/playState.test.ts client/src/playWorkspaceContract.test.ts
```

Expected: PASS.

- [ ] **Step 7: Verify C++ engine and production build**

Run repository release/sanitizer tests through the existing GitHub workflow and from `web/` run:

```bash
pnpm check
pnpm run build:vercel
```

Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add app/engine/src/main.cpp web/api/play.ts web/client/src/engine/playEngine.ts web/client/src/engine/playState.ts web/client/src/engine/playState.test.ts web/client/src/components/LegalChessBoard.tsx web/client/src/pages/Play.tsx web/client/src/play.css
git commit -m "feat: complete legal local play"
```

---

### Task 3: Replace Sample-Only Analyze With User-Loadable Live Analysis

**Files:**
- Create: `web/client/src/pages/Analyze.tsx`
- Create: `web/client/src/engine/fen.ts`
- Create: `web/client/src/engine/fen.test.ts`
- Modify: `web/client/src/App.tsx`
- Reuse: `web/client/src/engine/serverEngine.ts`
- Reuse: `web/api/analyze.ts`
- Reuse: `web/client/src/components/ChessBoard.tsx`
- Modify: `web/client/src/production-redesign.css`

**Interfaces:**
- `validateFenShape(value: string): { ok: true; fen: string } | { ok: false; error: string }`.
- `analyzePosition(fen: string, depth: number): Promise<ServerEngineAnalysis>` remains the only browser -> Analyze API entry.
- Analyze page state owns `loadedFen`, `draftFen`, `analysis`, `loading`, `error`.

- [ ] **Step 1: Write failing FEN tests**

```ts
import { describe, expect, it } from "vitest";
import { validateFenShape } from "./fen";

describe("Analyze FEN validation", () => {
  it("accepts a six-field single-line FEN", () => {
    const result = validateFenShape("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(result.ok).toBe(true);
  });

  it("rejects multiline or incomplete FEN before the engine request", () => {
    expect(validateFenShape("8/8/8\n8 w - - 0 1").ok).toBe(false);
    expect(validateFenShape("8/8/8/8/8/8/8/8 w").ok).toBe(false);
  });
});
```

- [ ] **Step 2: Verify RED**

```bash
pnpm vitest run client/src/engine/fen.test.ts
```

Expected: FAIL because `fen.ts` does not exist.

- [ ] **Step 3: Implement minimal validation**

Implement the exact six-field/single-line/length<=180 contract already enforced by `/api/analyze`, so client and server reject the same broad malformed inputs.

- [ ] **Step 4: Build the new Analyze page**

Create `Analyze.tsx` with the shared `ProductHeader`, a textarea/input containing the current FEN, `Load position`, Beginner (depth 5) / Advanced (depth 8), and `Analyze position`. On Load, validate and update `loadedFen`. On Analyze, call `analyzePosition(loadedFen, depth)`. Render only API-backed bestMove, scoreCp/100, depth, principalVariation, engine, plus a board arrow parsed from UCI best move. No success toast may imply saved/imported data that does not exist.

Update `App.tsx` so `/analyze` and `/review` use `Analyze`, not sample `Home`.

- [ ] **Step 5: Add a product contract**

Extend `liveAnalysisContract.test.ts` to require the Analyze source to contain a FEN input, `analyzePosition(loadedFen`, and to reject `sampleGame` imports from `Analyze.tsx`.

- [ ] **Step 6: Verify tests/check/build**

```bash
pnpm vitest run client/src/engine/fen.test.ts client/src/liveAnalysisContract.test.ts
pnpm check
pnpm run build:vercel
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add web/client/src/pages/Analyze.tsx web/client/src/engine/fen.ts web/client/src/engine/fen.test.ts web/client/src/App.tsx web/client/src/liveAnalysisContract.test.ts web/client/src/production-redesign.css
git commit -m "feat: make Analyze position-driven"
```

---

### Task 4: Finish Learn as a Real Local Progress Surface

**Files:**
- Create: `web/client/src/data/lessons.ts`
- Create: `web/client/src/lib/localProgress.ts`
- Create: `web/client/src/lib/localProgress.test.ts`
- Modify: `web/client/src/pages/Learn.tsx`
- Modify: `web/client/src/learn.css`

**Interfaces:**
- `Lesson = { key: string; title: string; summary: string; difficulty: string; minutes: number; checkpoints: string[] }`.
- `readNumberProgress(storage: Storage, key: string): Record<string, number>` returns `{}` for missing/corrupt data.
- `writeNumberProgress(storage: Storage, key: string, value: Record<string, number>): void`.

- [ ] **Step 1: Write failing persistence tests**

```ts
import { describe, expect, it } from "vitest";
import { readNumberProgress, writeNumberProgress } from "./localProgress";

describe("local progress", () => {
  it("falls back to empty progress for corrupt storage", () => {
    const storage = { getItem: () => "{bad", setItem() {}, removeItem() {}, clear() {}, key: () => null, length: 1 } as Storage;
    expect(readNumberProgress(storage, "x")).toEqual({});
  });

  it("round-trips numeric progress", () => {
    const data = new Map<string, string>();
    const storage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => void data.set(k,v), removeItem: k => void data.delete(k), clear: () => data.clear(), key: () => null, get length() { return data.size; } } as Storage;
    writeNumberProgress(storage, "x", { lesson: 2 });
    expect(readNumberProgress(storage, "x")).toEqual({ lesson: 2 });
  });
});
```

- [ ] **Step 2: Verify RED, then implement helper**

```bash
pnpm vitest run client/src/lib/localProgress.test.ts
```

Expected before implementation: FAIL. After implementing the two helpers: PASS.

- [ ] **Step 3: Extract lesson catalog and remove residual placeholders**

Move the current three lessons to `data/lessons.ts`, type them, and make Learn use the shared ProductHeader. Preserve checkpoint completion/reset behavior through `localProgress.ts`. No nav item may toast `next production surface`.

- [ ] **Step 4: Verify Learn and global contracts**

```bash
pnpm vitest run client/src/lib/localProgress.test.ts client/src/productRoutes.test.ts
pnpm check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/client/src/data/lessons.ts web/client/src/lib/localProgress.ts web/client/src/lib/localProgress.test.ts web/client/src/pages/Learn.tsx web/client/src/learn.css
git commit -m "feat: persist local learning progress"
```

---

### Task 5: Make Puzzles Board-Interactive and Validate Real Move Lines

**Files:**
- Create: `web/client/src/data/puzzles.ts`
- Create: `web/client/src/lib/puzzleValidation.ts`
- Create: `web/client/src/lib/puzzleValidation.test.ts`
- Modify: `web/client/src/pages/Puzzles.tsx`
- Reuse: `web/client/src/components/LegalChessBoard.tsx`
- Reuse: `web/client/src/engine/playEngine.ts`
- Reuse: `web/client/src/lib/localProgress.ts`
- Modify: `web/client/src/puzzles.css`

**Interfaces:**
- `Puzzle = { id: string; title: string; theme: string; difficulty: string; fen: string; prompt: string; solution: string[]; explanation: string }` where `solution` is UCI.
- `validatePuzzlePrefix(solution: string[], attempt: string[]): "correct-prefix" | "solved" | "wrong"`.

- [ ] **Step 1: Write failing puzzle-line tests**

```ts
import { describe, expect, it } from "vitest";
import { validatePuzzlePrefix } from "./puzzleValidation";

describe("puzzle line validation", () => {
  const solution = ["d1d8"];
  it("accepts a correct prefix", () => expect(validatePuzzlePrefix(solution, [])).toBe("correct-prefix"));
  it("marks the full line solved", () => expect(validatePuzzlePrefix(solution, ["d1d8"])).toBe("solved"));
  it("rejects a wrong legal move", () => expect(validatePuzzlePrefix(solution, ["d1d7"])).toBe("wrong"));
});
```

- [ ] **Step 2: Verify RED, implement validator, verify GREEN**

```bash
pnpm vitest run client/src/lib/puzzleValidation.test.ts
```

Expected: FAIL before implementation, PASS after minimal pure prefix comparison.

- [ ] **Step 3: Convert catalog from SAN choices to UCI solution lines**

Move puzzle data to `data/puzzles.ts`. Replace `choices`/`answer` with exact UCI `solution` arrays that are legal from each FEN. Keep explanations and difficulty metadata.

- [ ] **Step 4: Replace candidate buttons with the shared legal board**

Puzzles loads the active puzzle FEN through `/api/play`, renders `LegalChessBoard`, appends each accepted legal UCI move to `attempt`, validates the prefix, and shows inline `Correct / Solved / Try again`. On wrong move, reset the position to the puzzle FEN so the user can retry. On solved, persist the puzzle id through localStorage. The queue remains usable.

- [ ] **Step 5: Verify puzzle and product contracts**

```bash
pnpm vitest run client/src/lib/puzzleValidation.test.ts client/src/productRoutes.test.ts client/src/playWorkspaceContract.test.ts
pnpm check
pnpm run build:vercel
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/client/src/data/puzzles.ts web/client/src/lib/puzzleValidation.ts web/client/src/lib/puzzleValidation.test.ts web/client/src/pages/Puzzles.tsx web/client/src/puzzles.css
git commit -m "feat: make ChessIQ puzzles interactive"
```

---

### Task 6: Mobile Production Gate, Placeholder Scan, and Live Vercel Verification

**Files:**
- Modify: `web/client/src/production-redesign.css`
- Modify: `web/client/src/play.css`
- Modify: `web/client/src/learn.css`
- Modify: `web/client/src/puzzles.css`
- Modify: `web/client/src/mobileLayout.test.ts`
- Create: `web/client/src/productionFunctionality.test.ts`
- Modify: `.github/workflows/frontend-quality.yml` only if the production-web job does not already execute all `web/client/src/**/*.test.ts` tests.

**Interfaces:**
- At `max-width: 1030px`, Play/Analyze/Puzzles main layouts use one column and boards are `width: 100%; max-width: 100%` inside their container.
- The production functionality contract scans implemented surfaces for banned placeholder phrases.

- [ ] **Step 1: Write the failing final product contract**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = ["pages/Play.tsx", "pages/Analyze.tsx", "pages/Learn.tsx", "pages/Puzzles.tsx"];

describe("production functionality", () => {
  it("contains no preview-only primary behavior", () => {
    for (const file of files) {
      const source = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/coming next|local development sample|engine bridge pending|planned after|will be available/);
    }
  });
});
```

Extend `mobileLayout.test.ts` to require the route-specific grids/stacks to collapse under `@media (max-width: 1030px)`.

- [ ] **Step 2: Verify RED if any residual placeholder/mobile issue remains**

```bash
pnpm vitest run client/src/productionFunctionality.test.ts client/src/mobileLayout.test.ts
```

Expected: FAIL only for any genuine remaining placeholder/layout gap; if it passes immediately, inspect manually that the contract names the production classes actually used before accepting it.

- [ ] **Step 3: Apply only the CSS/copy fixes required by the tests**

Make mobile order explicit:

```css
@media (max-width: 1030px) {
  .play-layout,
  .analysis-layout,
  .puzzles-layout,
  .learn-layout { grid-template-columns: 1fr; }

  .play-board-card,
  .analysis-main-column,
  .analysis-side-stack,
  .puzzle-stage,
  .puzzle-queue { min-width: 0; width: 100%; }
}
```

Adapt selectors to the exact existing class names; do not introduce unused CSS solely to satisfy a text test.

- [ ] **Step 4: Run the full repository gates**

Frontend from `web/`:

```bash
pnpm test
pnpm check
pnpm run build:vercel
```

Existing `app` gate: unit tests, TypeScript, accessibility, production build.

C++ gate: release build/tests and sanitizer build/tests.

Expected: all green.

- [ ] **Step 5: Push preview and verify Vercel runtime**

On the Vercel preview for this branch verify:

```text
GET /api/analyze?smoke=1 -> 200 JSON containing engine="ChessEngine 0.3" and a non-empty bestMove
GET /api/play?smoke=1 -> 200 JSON containing fen, legalMoves, status, engine
/play -> 200
/analyze -> 200
/learn -> 200
/puzzles -> 200
```

Also check runtime logs for `error`/`fatal` entries caused by these requests. Do not claim browser visual QA if the environment cannot render the protected preview; report that limitation explicitly.

- [ ] **Step 6: Merge and repeat public production smoke**

After all checks pass, merge the PR to `main`, wait for the production deployment to be READY, and repeat `/api/analyze?smoke=1`, `/api/play?smoke=1`, plus the four route HTTP checks against `chessiq-flame.vercel.app`.

- [ ] **Step 7: Commit final responsive/contracts work before merge**

```bash
git add web/client/src/*.test.ts web/client/src/*.css .github/workflows/frontend-quality.yml
git commit -m "test: enforce functional production ChessIQ"
```
