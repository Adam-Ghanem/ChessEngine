# Architecture

## Current milestone

Milestone 1 establishes the project foundation only. No chess rules, board representation, move generation, evaluation, or search logic belongs in this milestone.

## Layout

- `include/` — public/internal headers grouped by subsystem.
- `src/` — implementation files grouped by subsystem.
- `tests/` — executable regression and unit tests.
- `docs/` — architecture and subsystem documentation.

## Build system

CMake is the single build entry point. The project requires C++20, disables compiler extensions, and enables strict warnings.

The initial test infrastructure intentionally uses a small dependency-free harness. GoogleTest can be introduced later if the test suite grows enough to justify the dependency.

## Architectural principles

1. Keep chess state and algorithms modular.
2. Keep hot paths allocation-free where practical.
3. Prefer deterministic, reproducible tests.
4. Establish correctness before optimization.
5. Introduce dependencies only when they provide clear value.
