# ChessEngine

A modular chess engine built from scratch in modern C++20.

## Current status

The engine has completed the core chess pipeline through PERFT and now includes a first complete playing/search layer:

- M1–M9: representation, moves, legal move generation, make/undo, game status and PERFT
- M10: static evaluation with material, piece-square tables, bishop pair and king/endgame terms
- M11: Negamax with alpha-beta pruning
- M12: iterative deepening and principal variation search
- M13: move ordering with TT move, MVV-LVA, killer moves and history heuristic
- M14: quiescence search
- M15: deterministic Zobrist hashing and transposition table
- M16: UCI protocol, time controls and hash configuration
- M17: small deterministic opening book
- M18: search-strength improvements and endgame-aware evaluation
- M19: regression coverage for search in addition to the existing M1–M9 suite
- M20: built-in `bench` command for repeatable search measurements

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
go depth 8
```

The engine also provides useful console commands:

```text
perft 4
eval
bench
```

Supported UCI search controls include `depth`, `movetime`, `wtime`, `btime`, `winc`, and `binc`. The `Hash` option controls the transposition-table size in MB.

## Architecture

The implementation is intentionally incremental and keeps the chess rules independent from the search layer:

1. Project foundation
2. Chess representation
3. Board representation and FEN
4. Move representation
5. Pseudo-legal move generation
6. Legal move generation
7. Make/undo move
8. PERFT
9. Static evaluation
10. Negamax and alpha-beta search
11. Iterative deepening
12. Move ordering
13. Quiescence search
14. Zobrist hashing and transposition table
15. Advanced search
16. UCI
17. Opening book
18. Strength improvements
19. Comprehensive testing
20. Benchmarking

## Engineering priorities

Correctness comes before optimization. Every major subsystem is compiled and regression-tested before it is used by the next layer.
