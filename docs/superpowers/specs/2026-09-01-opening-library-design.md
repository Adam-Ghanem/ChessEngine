# ChessIQ Opening Library — Design

Date: 2026-09-01
Status: Proposed for implementation

## Goal

Turn ChessIQ Learn into a serious opening-training product with broad global opening coverage, structured navigation, original explanations, and direct practice. The library must cover the full ECO range A00–E99, including opening families, named variations, subvariations, and common transpositions, without copying copyrighted book prose.

## Product principles

1. **Facts are imported, teaching is authored by ChessIQ.** Names, ECO codes, move sequences, UCI moves, and opening positions come from a permissively reusable factual dataset. Explanations, plans, mistakes, and training prompts are original ChessIQ content.
2. **Tree, not a flat catalog.** Users browse from family → variation → subvariation and can also search by name, move sequence, or ECO code.
3. **Board-first learning.** Every opening page has an interactive board and move navigator. Text supports the position instead of replacing it.
4. **Practice is part of the opening page.** Each opening can lead directly to opening-specific recall and decision puzzles.
5. **First-party ChessEngine stays authoritative for legality and position validation.** No Stockfish replacement.
6. **No fabricated popularity, rating, win-rate, or mastery numbers.** Only display metrics supported by real data.

## Source taxonomy and licensing

Primary factual source: `lichess-org/chess-openings`.

The dataset provides:
- ECO classification
- English opening name
- representative PGN move sequence
- UCI move sequence in generated distributions
- EPD/opening position
- multiple entries where needed for transpositions

The project states that this collection of opening facts is released under CC0/Public Domain Dedication. ChessIQ will preserve source attribution in repository documentation even though CC0 does not require attribution.

Reference sources:
- https://github.com/lichess-org/chess-openings
- https://github.com/lichess-org/chess-openings/blob/master/README.md
- https://en.wikipedia.org/wiki/Encyclopaedia_of_Chess_Openings

ECO spans 500 codes: A00–A99, B00–B99, C00–C99, D00–D99, E00–E99.

## Scope

### In scope

- Complete A00–E99 opening catalog from the imported factual dataset.
- Family, variation, and subvariation hierarchy derived from structured opening names.
- Transposition-aware indexing.
- Search by opening name, variation name, ECO code, and moves.
- Dedicated `/learn/openings` explorer.
- Dedicated opening detail route.
- Interactive opening board with step-forward/back navigation.
- Original ChessIQ explanation schema for every teachable opening entry.
- Opening-specific training prompts and puzzles.
- Local progress tracking compatible with current Learn progress architecture.
- Responsive premium ChessIQ UI.
- Unit, contract, accessibility, and production-web tests.

### Out of scope for the first implementation cycle

- Live multiplayer opening statistics.
- Cloud accounts or cross-device sync.
- User-created opening repertoires.
- Paid-book ingestion or copied book annotations.
- Stockfish as the main engine.
- Huge external master-game database hosting.

These can be separate future specs.

## Architecture

The feature is split into five isolated units.

### 1. Opening data package

Add a generated opening catalog under the production web source tree, with a deterministic import script rather than hand-maintaining thousands of entries.

Suggested structure:

```text
web/
  data/
    openings/
      source/                 # pinned upstream factual source or normalized snapshot
      generated/
        openings.json
        opening-index.json
  scripts/
    build-openings.ts
  client/src/lib/openings/
    types.ts
    catalog.ts
    search.ts
    progress.ts
```

The generated record shape:

```ts
type OpeningRecord = {
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
```

IDs must be stable and deterministic from ECO + normalized name + shortest distinguishing line.

### 2. ChessIQ teaching layer

Facts and teaching content are separate. This prevents upstream opening-data refreshes from overwriting ChessIQ lessons.

```ts
type OpeningLesson = {
  openingId: string;
  overview: string;
  goalsForWhite: string[];
  goalsForBlack: string[];
  typicalPawnStructures: string[];
  keySquares: string[];
  commonPiecePlans: string[];
  pawnBreaks: string[];
  commonMistakes: string[];
  tacticalMotifs: string[];
  transitionToMiddlegame: string[];
  checkpoints: OpeningCheckpoint[];
};
```

Teaching prose must be original, concise, position-specific, and written in ChessIQ’s instructional voice. The system should support incremental enrichment: every opening is browsable immediately from factual data, while detailed teaching depth can grow family by family without blocking complete catalog coverage.

### 3. Opening Explorer UI

Route: `/learn/openings`

Main regions:
- search field
- ECO A–E filters
- family navigation
- expandable variation tree
- recent/continued openings from local progress

Search behavior:
- exact ECO match ranks first
- family/name prefix matches next
- normalized substring matches next
- move-sequence lookup when input resembles SAN/UCI moves

No fake “most popular” ordering. Default order is curated major-family grouping, then ECO/name ordering.

### 4. Opening detail + interactive board

Route format:

`/learn/openings/:eco/:slug`

Detail layout:
- interactive board
- move timeline
- opening name + ECO
- breadcrumb family path
- original explanation cards
- White plan / Black plan
- key pawn breaks
- common mistakes
- typical middlegame transition
- “Practice this opening” action
- “Analyze this position” action carrying the current FEN/EPD position into Analyze

The board starts at the initial position and replays the opening UCI sequence. ChessIQ’s existing board/legal-move utilities should be reused where possible. The first-party ChessEngine validates imported lines during generation or tests.

### 5. Opening training bridge

Opening training is not a separate content silo. Every opening detail page exposes training generated from its own line and lesson checkpoints.

Initial puzzle types:
- **Next move recall:** choose/play the thematic next move from a known line.
- **Plan recognition:** choose the correct strategic plan from the resulting position.
- **Mistake avoidance:** identify a common opening mistake and its refutation concept.
- **Transposition recognition:** identify the opening reached by a different move order.

Successful completion advances immediately to the next suitable prompt. Progress records correct/incorrect attempts by `openingId` and theme. Adaptive scheduling can be expanded later without changing the core data interface.

## Data flow

1. Pinned opening source is read by `build-openings.ts`.
2. Script normalizes ECO, name hierarchy, moves, EPD, and aliases.
3. Script rejects malformed records and duplicate unstable IDs.
4. Optional ChessEngine validation verifies legal move replay and final position.
5. Generated JSON/index is consumed by the frontend catalog module.
6. Explorer queries the local index without a network dependency.
7. Detail page loads the factual record plus optional ChessIQ lesson content.
8. Progress is stored locally using a versioned key until account sync is designed separately.

## Transpositions

Transpositions are first-class. The catalog must not assume one unique move order per opening name.

Rules:
- multiple move sequences may resolve to the same named opening
- the shortest unique line remains the canonical display line
- equivalent final EPD positions may be grouped through `transpositionGroup`
- search can surface alternate move orders but routes resolve to one canonical opening page

## Content-generation policy

ChessIQ must not copy prose, diagrams, annotations, or exercises from copyrighted chess books or commercial courses.

Allowed inputs:
- public-domain/CC0 factual opening data
- generally known chess concepts
- positions generated from legal opening lines
- first-party engine evaluation/validation where implemented

ChessIQ explanations are newly authored summaries of ideas such as development, center control, pawn structures, key breaks, typical piece placement, tactical motifs, and middlegame plans.

## Error handling

- Import fails hard on invalid ECO format, illegal UCI sequence, or malformed EPD.
- Duplicate IDs fail generation rather than silently overwriting.
- Missing teaching content shows a neutral factual opening overview and board, never fabricated detail.
- Unknown opening route returns a clear not-found state with a link back to Opening Explorer.
- Invalid query move input produces no-result guidance instead of an exception.
- Local progress parsing follows the project’s current defensive fallback pattern.

## Performance

Thousands of opening records must not inflate the initial application bundle unnecessarily.

Implementation should:
- keep a compact search index separate from full records
- lazy-load detail data where practical
- avoid rendering the entire variation tree at once
- virtualize or progressively expand large family lists if profiling shows a need
- preserve current mobile board-square integrity

## Accessibility

- keyboard-operable tree and search
- visible focus states
- board controls have descriptive labels
- move timeline is usable without relying on color
- reduced-motion preference remains respected
- opening hierarchy uses semantic headings/breadcrumbs

## Testing strategy

### Import/data tests
- every record has valid ECO A00–E99
- stable unique IDs
- UCI line parses and is legal
- generated final position matches EPD
- family/variation parsing is deterministic
- transposition grouping is deterministic

### Frontend tests
- `/learn/openings` is directly addressable
- name and ECO search return expected records
- variation tree expands/collapses accessibly
- detail route resolves canonical opening
- move navigator reaches expected positions
- Analyze handoff contains current position
- progress persists and malformed storage safely resets

### Regression checks
- existing Learn lessons remain usable
- ProductHeader navigation and skip link remain intact
- Play board responsiveness and piece-motion behavior remain untouched
- production build continues from `/web`
- first-party C++ ChessEngine still builds in CI/Vercel

## Rollout

The implementation plan should deliver this in incremental PR-sized slices:

1. deterministic CC0 opening-data importer + validation + generated catalog
2. opening catalog/search library + tests
3. `/learn/openings` explorer UI
4. opening detail board/timeline + Analyze handoff
5. original teaching schema and initial broad family explanations
6. opening-specific training flow + progress integration
7. content-enrichment passes across ECO families until all catalog entries have at least baseline explanation coverage

Each slice must pass the existing GitHub CI. Vercel production claims require verification that the deployment used `/vercel/path0/web` and the intended commit SHA.

## Success criteria

The feature is considered complete for this spec when:

- the full imported A00–E99 catalog is searchable and browsable
- named families/variations/subvariations are represented hierarchically
- transpositions do not create broken or contradictory navigation
- every opening page has a board, legal canonical line, and at least a baseline original ChessIQ explanation
- major families have richer plans, structures, mistakes, and training prompts
- users can practice an opening and immediately receive the next prompt
- users can send the current opening position into Analyze
- progress persists locally without fake metrics
- frontend/accessibility/build tests are green
- production deployment, when merged, is verified from the actual `/web` Vercel build path
