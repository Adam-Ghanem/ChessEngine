# ChessIQ Frontend Audit

## Current architecture

The frontend is a React/Vite single-page workstation with a focused, reusable component model. `Home.tsx` owns selected-ply, theme, and short-lived analysis state; the `ChessBoard`, `EvaluationBar`, `EvaluationGraph`, `MoveList`, `AnalysisPanel`, `CriticalMoments`, `ClassificationBadge`, and `BrandMark` components are already separated from the page. `AnalysisMove` is a sound initial data contract, but it should be extended into a complete analysis model before the WebAssembly and PGN integration arrives.

| Area | Current strength | Issue to address in ChessIQ |
| --- | --- | --- |
| Board | Responsive FEN-rendered grid, coordinate labels, selected/target feedback, engine arrow and last-move state. | The board needs richer check/checkmate/annotation states and a coordinated move-transition cue. |
| Evaluation | Board-attached spine and clickable custom SVG graph already share selected-ply state. | Graph limits, x-axis labels, markers, and engine pulse are partly static or implicit. |
| Analysis rail | Engine values, continuation, explanation, moments, and accuracy are visible without obscuring the board. | It needs beginner/advanced density modes, a stronger move-to-explanation thread, and real data boundaries. |
| Theme | Dark and light themes exist through `data-theme`; CSS uses a cohesive palette. | `ThemeContext` and shadcn's `.dark` convention are unused/stale, so the theme implementation should be consolidated. |
| Motion | Transform/opacity-focused transitions, an engine pulse, and a reduced-motion guard are present. | Timing values are scattered and there is no ChessIQ-wide IQ Pulse system. |
| Accessibility | Buttons have labels and focus outlines; graph points are operable controls; move state uses `aria-current`. | Board keyboard behavior, high-contrast states, and classification descriptions need deeper treatment. |
| Responsive behavior | Desktop preserves board priority; mobile converts to a board-first vertical sequence without horizontal board scroll. | The mobile experience needs a secondary-information bottom sheet and a clearer analysis order: board, evaluation, controls, engine, explanation, graph. |

## Product-facing audit

The current public identity still reads **ChessEngine** in the wordmark, HTML title, description, favicon asset, and analysis copy. The page has no Open Graph metadata. The current `Manrope` plus `IBM Plex Mono` pairing and copper/cyan palette match the previous Calculated Fieldwork direction, but they do not yet meet the requested ChessIQ typography and electric-violet/teal identity.

## Visual audit

At 1440px the existing screen is composed, board-first, and well suited to systematic refinement rather than replacement. At 390px the board remains readable and the task order is understandable, but the graph currently precedes the engine/explanation and secondary information is fully stacked instead of selectively disclosed. The rebrand should keep the hierarchy while introducing the three ChessIQ signatures: IQ Pulse, Calculation Grid, and an explicit Analysis Thread.

## First implementation scope

The next increment will not expand into the deferred Play, Learn, Puzzle, Games, Progress, or Coach product routes. It will centralize tokens, create the ChessIQ mark and metadata, polish the flagship analysis surface, implement beginner/advanced analysis views, deliver classification and Try Again interactions, and strengthen mobile behavior around the board-first experience.
