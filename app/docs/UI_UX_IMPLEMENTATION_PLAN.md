# ChessEngine UI/UX Implementation Plan

## Audit conclusion

The current ChessEngine repository is a C++20 rules and search engine with a small Embind bridge. It does not contain a product-facing UI. The bridge already exposes the core browser contract needed by a frontend: a FEN plus requested depth returns a JSON result with `bestMove`, `score`, `depth`, `nodes`, and `pv`. The frontend must remain a separate application layer so that no chess rule or search behavior is duplicated in view components.

| Layer | Responsibility | Current state | Frontend treatment |
| --- | --- | --- | --- |
| Chess rules | Positions, legal moves, game status | Implemented in C++ | Consumed through a future structured game-state adapter. |
| Search engine | Evaluation, best move, PV, depth, nodes | Implemented in C++ | Wrapped by a typed engine client around the existing WebAssembly bridge. |
| Application state | Current game, selected ply, board orientation, analysis state | Not yet present | Local React state for the prototype; extract to a store as live data grows. |
| UI | Board, move timeline, evaluation graph, explanations, navigation | Not yet present | Implement now as reusable, data-driven React components. |

## First implementation scope

The first increment builds the **game-analysis workstation** rather than attempting all planned product areas. It contains a playable presentational board with legal-move and selection feedback, coordinated move navigation, an animated evaluation bar, engine panel, move list, graph, critical moments, and a human-readable explanation panel. The screen uses structured in-memory analysis data so each component can later consume the real engine contract without a rewrite.

| Priority | Capability | First increment | Deferred integration |
| --- | --- | --- | --- |
| P0 | Game-analysis workstation | Responsive board, board controls, selected move state, engine readout, move list, graph, explanations | Live game-state, full PGN parser, production piece assets. |
| P0 | Visual system | Dark-first and light-mode tokens, motion rules, type hierarchy, semantic move states | User-persisted settings. |
| P1 | Input and analysis workflow | Analyzing / complete / error presentation states; an import affordance | File drop, paste PGN, engine execution. |
| P1 | History and summary | Critical-moment list and accuracy summary scaffold | Persisted history, export and share links. |
| P2 | Supporting product surfaces | Navigation and clear affordances for Play, Games, Puzzles, and Statistics | Full individual routes and live data. |

## Interaction model

The move list, board transport controls, evaluation graph, and critical-moment entries all point to the same selected-ply state. Changing that state updates the board position, selected move treatment, evaluation number, graph crosshair, engine line, and explanation in one render path. This preserves the user’s mental model and enables a later `AnalysisResult` adapter.

## Responsive behavior

| Breakpoint | Board | Analysis | Navigation |
| --- | --- | --- | --- |
| Desktop, 1180px+ | Dominant central instrument with adjacent evaluation spine | Persistent right rail, graph below board | Full text navigation. |
| Laptop/tablet, 760px–1179px | Large board with fluid scaling | Collapses under board into segmented analysis areas | Compact labels. |
| Mobile, below 760px | Full available width, no horizontal board scroll | Board-first stack with thumb-reachable transport and expandable detail | Icon-led command header; analysis follows move controls. |

## Quality requirements

The implementation must provide visible keyboard focus, labelled controls, color-independent classification labels, sufficient dark-mode contrast, reduced-motion support, and transform/opacity-only UI transitions. The UI will show only factual engine values once a real result is connected; prototype data is clearly marked as a staged interface preview rather than presented as a native search result.

## Integration path

1. Copy the generated `chessengine-wasm.js` and `.wasm` output into the frontend deployment asset pipeline.
2. Create a typed `EngineClient` that dynamically imports the modularized Emscripten output and exposes `analyze(fen, depth)`.
3. Use a PGN/game-state adapter to derive FEN for the selected ply.
4. Normalize each result to a `PositionAnalysis` object for the existing UI components.
5. Replace the staged analysis data incrementally, adding worker isolation if analysis affects foreground responsiveness.
