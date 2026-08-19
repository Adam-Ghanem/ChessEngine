# ChessEngine

A modular chess engine built from scratch in modern C++20.

## Current status

Milestone 1 — Project Foundation is in progress.

At this stage the project contains only the build system, executable entry point, and a lightweight test harness. Chess logic is intentionally not implemented yet.

## Build

```bash
mkdir build
cd build
cmake ..
cmake --build .
```

## Run

```bash
./ChessEngine
```

On Windows, run `ChessEngine.exe` from the build output directory.

## Tests

```bash
ctest --output-on-failure
```

## Architecture roadmap

The engine will be developed incrementally:

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

Correctness comes before optimization. Every major subsystem will be implemented, compiled, tested, and regression-checked before the next subsystem is started.
