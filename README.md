# ChessEngine

A modular chess engine built from scratch in modern C++20.

## Current status

The engine has completed the core chess pipeline through PERFT and now has a substantially upgraded playing/search layer:

- **M1–M9:** representation, moves, legal move generation, make/undo, game status and PERFT
- **M10:** static evaluation with material and piece-square tables
- **M11:** Negamax with alpha-beta pruning
- **M12:** iterative deepening and principal variation search
- **M13:** move ordering with TT move, MVV-LVA, killer moves and history heuristic
- **M14:** quiescence search, including full evasions while in check
- **M15:** deterministic Zobrist hashing and transposition table with mate-score normalization
- **M16:** UCI protocol, time controls and hash configuration
- **M17:** deterministic search instead of a shallow hard-coded opening shortcut
- **M18:** pawn-structure, passed-pawn, rook-file and endgame-aware evaluation terms
- **M19:** search regression coverage
- **M20:** repeatable multi-position `bench` command
- **M21:** upgraded search core with aspiration windows and selective check extensions
- **M22:** null-move pruning with reversible state support and regression coverage
- **M22.2:** late move reductions for quiet, non-critical moves with tactical safeguards
- **M22.3:** shallow futility pruning with score-preservation regression coverage
- **CI:** Release build plus AddressSanitizer/UndefinedBehaviorSanitizer verification

Correctness remains the priority: the existing PERFT suite is kept as a regression gate before search changes are considered complete.

## Build

```bash
mkdir build
cd build
cmake ..
cmake --build .
ctest --output-on-failure
```

## UCI

Run the executable and communicate with it using the standard UCI protocol:

```text
uci
isready
position startpos
go depth 8
```

Supported search controls include `depth`, `movetime`, `wtime`, `btime`, `winc`, and `binc`.

The engine exposes:

```text
perft 4
eval
bench 6
```

`bench` runs a deterministic suite of representative positions and reports total nodes, elapsed time and NPS.

The UCI `Hash` option controls the transposition-table size in MB.

## WebAssembly build

The repository includes a small Embind bridge for a real browser integration. It accepts a FEN plus a requested depth and returns the C++ engine’s best move, score, depth, nodes, and principal variation as JSON.

```bash
sudo apt-get install emscripten
chmod +x tools/build-wasm.sh
tools/build-wasm.sh /path/to/output
```

The script emits `chessengine-wasm.js` and `chessengine-wasm.wasm`. The browser companion loads these assets through Emscripten’s modularized ES-module output; it never presents a heuristic reply as a native-engine result.

## Search architecture

The search layer is intentionally separate from the chess-rule implementation:

1. Legal move generation
2. Static evaluation
3. Iterative deepening
4. Alpha-beta / PVS
5. Transposition table
6. TT / MVV-LVA / killer / history move ordering
7. Quiescence search with check evasions
8. Aspiration windows
9. Selective check extensions
10. Null-move pruning
11. Late move reductions
12. Shallow futility pruning
13. UCI time management
14. Deterministic benchmarking

## Evaluation

The evaluation combines:

- material balance
- piece-square tables
- bishop-pair bonus
- doubled and isolated pawn penalties
- passed-pawn bonuses
- rook open/semi-open file bonuses
- king/endgame piece-square terms

The evaluation is deliberately deterministic and lightweight so search behavior remains reproducible.

## Search pruning

The pruning layer is conservative by design. Null-move pruning is restricted to non-PV positions that are not in check and contain non-pawn material. Late move reductions apply only to quiet, late, non-checking moves that are not killer moves, and reduced searches are re-searched when they raise alpha. Futility pruning is limited to shallow non-PV nodes and never removes captures, promotions, checks, or killer moves. These safeguards keep tactical correctness ahead of node-count reduction.

## Engineering priorities

Correctness comes before optimization. Every major subsystem is compiled and regression-tested before it is used by the next layer. CI also runs sanitizer builds to catch memory errors and undefined behavior.

## ChessIQ application

The repository now also contains **ChessIQ**, a full-stack chess product in [`app/`](app/). It preserves this repository’s C++ engine and adds authenticated play, saved games, PGN import/export, bounded C++ UCI analysis, lessons, puzzles, private progress, activity-derived coaching, a complete openings explorer, and spaced-repetition opening training.

| Directory | Purpose | Runtime scope |
| --- | --- | --- |
| `app/` | Real ChessIQ Node, database, OAuth, and C++ engine service | Full product deployment |
| `web/` | Historical static analysis UI | Visual Vercel preview only |
| `src/` | Original C++20 ChessEngine | Engine development and UCI tooling |

For the real product, start with [`app/docs/CHESSIQ_FULLSTACK_DEPLOYMENT.md`](app/docs/CHESSIQ_FULLSTACK_DEPLOYMENT.md). The full-stack service is containerized so it can compile and run the first-party C++ engine alongside the Node API. The static Vercel preview in `web/` does not provide OAuth, database persistence, or server-side engine execution.

### Openings Explorer and Trainer

ChessIQ treats opening knowledge as a product-owned, deterministic learning system rather than a hard-coded popularity list.

- `/openings` is a searchable, board-first ECO explorer with a local A00–E99 catalog, move playback, named variations, ideas, and resilient master-game statistics.
- `/openings/:slug` is a dedicated opening detail workspace with ancestry, child variations, board playback, plans, statistics, and a direct **Train this line** action.
- `/trainer` supports White and Black repertoire recall, learn/recall/mixed presentation modes, legal-move validation, canonical alternatives, hints, explicit review ratings, and local guest sessions.
- `/progress` adds opening-specific White/Black mastery, due reviews, recent accuracy when evidence exists, and weakest branches derived from the user’s own persisted attempts.

The canonical opening data is vendored into `app/shared/openings/generated/` from a pinned snapshot of the `lichess-org/chess-openings` dataset, which is released under **CC0**. It is used locally for names, ECO codes, and legal move sequences. ChessIQ does not depend on that repository at runtime.

Live opening popularity is deliberately separate from correctness. Server-side queries to the Lichess opening explorer are validated, cached in MySQL, and bounded by a timeout. When the upstream service is unavailable, ChessIQ serves a stale persistent cache if one exists; otherwise it clearly reports statistics as unavailable. It never fabricates win rates or move counts.

Trainer correctness comes only from the canonical local repertoire plus `chess.js` legality. An upstream popularity result can never make a move correct or incorrect. Authenticated attempts are revalidated server-side before they update the dedicated spaced-repetition tables; guests can complete a session locally without persistence.

### Visual Opening Courses

ChessIQ Learn now includes exactly **100 complete opening courses** organized across five balanced families. The courses are built from the same local canonical opening catalog as Explorer and Trainer, so lesson positions and legal-move checkpoints remain deterministic and do not depend on live statistics.

- `/learn` is the discovery hub with text search plus family, side-focus, and difficulty filters.
- `/learn/openings/:lessonSlug` is a board-first lesson workspace with chapter navigation, authored explanations, visual arrows/zones/key squares, and legal-move checkpoints.
- Guests can study every course locally without signing in; authenticated users get monotonic saved progress and resume behavior.
- Checkpoint correctness is evaluated locally with `chess.js` against authored accepted moves. Illegal and legal-but-wrong moves receive distinct feedback.
- Course progress is shown separately from opening-trainer repertoire mastery. Completing a lesson records study progress; it does not claim that the opening has been mastered.
- Explorer and Trainer remain one click away from each lesson so study, reference, and spaced-repetition recall stay connected without duplicating opening data or board logic.
