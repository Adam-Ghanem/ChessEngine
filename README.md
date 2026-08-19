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
10. UCI time management
11. Deterministic benchmarking

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

## Engineering priorities

Correctness comes before optimization. Every major subsystem is compiled and regression-tested before it is used by the next layer. CI also runs sanitizer builds to catch memory errors and undefined behavior.
