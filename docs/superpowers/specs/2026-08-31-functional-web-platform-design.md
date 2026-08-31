# ChessIQ Functional Web Platform Design

## Goal

Replace the current `web/` showcase behavior with a genuinely usable public ChessIQ product on the existing Vercel project, without requiring login for the first functional milestone.

The production source of truth remains `web/` for this milestone because the current Vercel project builds from that directory. The first-party C++ ChessEngine remains the analysis engine and is already packaged into Vercel Functions.

## Success criteria

A visitor opening the public ChessIQ domain can:

- navigate real routes for Play, Analyze, Learn, and Puzzles;
- play a legal local chess game without signing in;
- start a new game, reset it, undo moves, and see game status;
- analyze the current position with the first-party C++ ChessEngine;
- paste or load a FEN in Analyze and receive live best move, evaluation, depth, and principal variation;
- work through real local lessons instead of `coming next` toasts;
- attempt tactical puzzles on an interactive legal board and validate the expected line locally;
- use the product on mobile as a true single-column responsive app;
- encounter no production-facing `coming next`, `local development sample`, or fake-success messaging in the implemented surfaces.

## Architecture

### 1. Client router and product shell

Add a lightweight route switch inside `web/client` using the existing React stack. The shell owns the brand, theme control, and product navigation. Routes:

- `/` and `/play` -> Play
- `/analyze` and `/review` -> Analyze
- `/learn` -> Learn
- `/puzzles` -> Puzzles

Unknown paths render a small Not Found surface with links back into the product.

No authentication or database is required in this milestone. State is local to the browser session.

### 2. Shared chess state

Use the existing `chess.js` dependency as the browser-side legal-move authority for public Play, Analyze position editing/import, and Puzzles.

A small shared game-state module will expose:

- current FEN;
- legal move application;
- undo/reset/new game;
- move history in SAN/UCI;
- game status such as turn, check, checkmate, stalemate, draw, and game over.

The visual board must consume this state instead of hard-coded `legalTargets`.

### 3. Play

Play becomes a real local chess board.

Primary behavior:

- start position by default;
- click source square then legal destination;
- pawn promotion automatically promotes to queen in this milestone;
- New Game, Undo, Reset;
- live turn/game-status label;
- move list.

This milestone is local two-player only. Playing against ChessEngine is explicitly deferred until the local game flow is stable.

### 4. Analyze

Keep the existing `/api/analyze` Vercel Function and first-party C++ ChessEngine integration.

Analyze will no longer depend on the fixed `sampleGame` as the only usable input. It will support:

- editable FEN input;
- Load Position action with validation;
- analysis of the currently loaded FEN;
- live result rendering: best move, centipawn score, depth, PV, engine name;
- board arrow for a valid engine best move;
- loading and error states that reflect the actual API response.

The legacy sample review data may remain only as an optional example dataset, never as the source of truth for live engine output.

### 5. Learn

Provide a small first-party lesson catalog stored in `web/client/src/data`.

Each lesson contains:

- title;
- difficulty;
- concise explanation;
- 3-5 actionable checkpoints;
- completion state stored in `localStorage`.

This is intentionally local-only for the first milestone. Server persistence moves to the later account phase.

### 6. Puzzles

Provide a curated local puzzle catalog with:

- FEN;
- title/theme/difficulty;
- expected UCI solution line.

The player makes legal moves on the same shared board logic. ChessIQ validates the entered move sequence against the expected solution and shows solved/try-again state. Solved puzzle keys are stored in `localStorage`.

### 7. Mobile layout

At the production mobile breakpoint, every main route becomes single-column.

Order priorities:

- Play: status -> board -> controls -> move list;
- Analyze: position input/status -> board -> Analyze action/result -> supporting panels;
- Puzzles: puzzle context -> board -> actions -> queue;
- Learn: lesson list/cards.

No two-column desktop layout may survive at phone-sized effective viewports.

## Data flow

### Play

User click -> shared chess state -> `chess.js` legal move validation -> updated FEN/history -> board re-render.

### Analyze

FEN input/current board -> client validation -> POST `/api/analyze` -> Vercel Function -> packaged C++ ChessEngine over UCI -> typed JSON -> live analysis panel.

### Learn

Lesson catalog -> lesson page/card -> completion -> `localStorage`.

### Puzzles

Puzzle catalog -> shared chess state -> legal user move -> compare UCI move sequence to puzzle solution -> solved/incorrect state -> `localStorage` completion.

## Error handling

- Illegal board moves are ignored or shown as a small inline status, never applied.
- Invalid FEN blocks analysis with a clear inline error.
- `/api/analyze` non-200 responses surface the server-provided message.
- Engine timeouts or unavailable binary errors do not fabricate evaluation results.
- Corrupt localStorage entries fall back to clean defaults.

## Testing

Use TDD for each functional increment.

Required automated coverage:

- router maps Play/Analyze/Learn/Puzzles to real surfaces;
- no primary nav item uses `coming next` toast behavior;
- legal move application and illegal move rejection;
- undo/reset/new-game behavior;
- FEN validation and Analyze client request/response contract;
- lesson completion persistence helpers;
- puzzle line validation;
- responsive contracts for single-column mobile layout;
- existing Vercel engine runtime regression tests remain green.

Verification before merge:

- production-web unit/product contracts;
- TypeScript check;
- Vite production build;
- existing app quality gate;
- C++ release and sanitizer workflows;
- Vercel preview READY;
- live preview smoke for `/api/analyze` returning real ChessEngine output;
- route smoke for `/play`, `/analyze`, `/learn`, `/puzzles`.

## Explicit non-goals for this milestone

- accounts/authentication;
- cloud database persistence;
- matchmaking or multiplayer;
- ratings/Elo;
- engine-vs-player mode;
- social sharing;
- paid plans;
- full PGN library/history synchronization.

Those belong to the next platform phase after the public no-login flows are stable.
