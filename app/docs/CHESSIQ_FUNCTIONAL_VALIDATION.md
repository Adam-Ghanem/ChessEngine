# ChessIQ Functional Validation

## Public routes

Desktop verification confirms that the Play, Analyze, Learn, Puzzles, Games, and Progress routes share one product header, preserve the Intelligence in Motion visual system, and expose clear sign-in gates before user-owned persistence is accessed. The public lesson and puzzle catalog states render without personal data.

## Responsive board

At 390px, the puzzle board remains square, pieces remain visible, coordinates do not overlap the interactive squares, and the action row stays touch-reachable. The mobile header reduces navigation clutter while retaining theme and sign-in actions.

## Functional boundary

Legal moves are calculated in the browser through `chess.js`; protected actions are routed through tRPC and stored with the authenticated user. The C++ ChessEngine parser and a real depth-two opening search pass unit tests. End-to-end authenticated persistence requires a signed-in user session and is intentionally not fabricated in test data.

## Accessibility and final route review

All primary product actions, navigation links, board squares, promotion choices, and text areas have visible `:focus-visible` treatment. The app-level reduced-motion guard removes non-essential animation. A desktop review of Play and Coach confirms clear signed-out account boundaries, while the 390px review of Play, Analyze, Learn, Puzzles, Progress, and Coach confirms that headline copy, account gates, and the active product action remain readable without horizontal overflow.

The automated `uiAccessibility` test verifies native link and button controls for the full product navigation, the keyboard-operable board squares and promotion buttons, the explicit focus-visible CSS rules, the global `prefers-reduced-motion` rule, and all seven functional routes. TypeScript, the production build, and all eight unit tests pass after this check.

### Runtime accessibility pass

`pnpm test:accessibility` was run against the active local full-stack service in Chromium. On each of Play, Analyze, Learn, Puzzles, Games, Progress, and Coach, the first five Tab presses reached the ChessIQ home link and primary navigation links with a visible `auto 1px` outline. With `prefers-reduced-motion: reduce` emulated in Chromium, the media query matched and button animation and transition durations computed to `1e-05s` (equivalent to the `.01ms` suppression rule). The machine-readable test record is retained in `docs/runtime_accessibility_result.json`.
