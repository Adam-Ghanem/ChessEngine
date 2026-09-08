# ChessIQ Functional Validation

## Public routes

Desktop verification covers Play, Analyze, Openings, opening detail, Learn, Puzzles, Games, Progress, Coach, and Trainer under the shared ChessIQ product header. Public opening catalog/detail/statistics/training-line reads do not require access to user-owned records. Protected opening review history and progress remain scoped to the authenticated user.

## Openings Explorer

`/openings` uses the project-owned canonical opening catalog for identity, ECO, names, legal move sequences, ancestry, ideas, and trainer correctness. The browser can search by opening name, ECO code, aliases, and move text, replay each legal line on the same ChessIQ board system, flip orientation, and jump to the dedicated detail workspace.

The local catalog is built from the vendored pinned CC0 `lichess-org/chess-openings` snapshot in `app/shared/openings/generated/`. Automated catalog validation confirms coverage for all 500 ECO codes from A00 through E99 and replays every stored line through `chess.js` legality checks.

## Live opening statistics failure boundary

Opening popularity is optional enrichment, not a correctness source. Server-side Lichess explorer responses are schema-validated and stored in the persistent `openingStatsCache` table. Fresh cache entries can be reused without an upstream request. On timeout, invalid payload, or upstream error, a stale persistent entry can be returned with an explicit stale state. If no cache exists, the UI reports statistics unavailable instead of inventing counts or win percentages.

## Opening Trainer

`/trainer` supports White and Black board orientation plus learn, recall, and mixed presentation modes. The client verifies chess legality before classifying an answer as canonical, acceptable repertoire alternative, legal but wrong, or illegal. The server independently replays the canonical prefix and revalidates legality and repertoire membership before any authenticated attempt is persisted.

Guests can train a selected opening locally. Authenticated users additionally persist attempts and deterministic spaced-repetition state. A failed save is surfaced as `Not synced` while the current local session continues; the client does not pretend that an unsuccessful write was stored.

The trainer unit contract covers canonical moves, accepted alternatives, legal non-repertoire moves, illegal moves, Black-to-move legality, deterministic queue ordering, and side-to-board orientation.

## Opening Progress

The Progress route includes opening-specific White and Black repertoire summaries, due-review count, recent accuracy only when attempt evidence exists, and weakest branches. Mastery is derived from recorded accuracy, retention, due state, interval, and review evidence; completing or merely viewing a line does not automatically mark it mastered.

## Responsive board

At mobile widths, the openings explorer collapses from three columns to a board-first single-column flow and keeps the selected-line training action touch-reachable in a fixed bottom dock. The opening detail and trainer workspaces also collapse to board-first layouts. Board squares remain keyboard-focusable and retain visible selected, legal, active-move, and expected-move states.

## Functional boundary

Legal moves are calculated in the browser through `chess.js`; protected actions are routed through tRPC and stored with the authenticated user. The C++ ChessEngine remains responsible for engine analysis, while opening identity/training is intentionally deterministic and independent of engine evaluation or live popularity.

## Accessibility and final route review

Primary product actions, navigation links, board squares, opening-tree controls, search controls, transport buttons, trainer ratings, and text inputs use native interactive controls with visible `:focus-visible` treatment. The app-level reduced-motion guard removes non-essential animation, and openings/trainer styles add reduced-motion protection for feature-specific transitions.

The automated frontend suite checks the product navigation, openings routes, three-column-to-mobile collapse contract, the detail **Train this line** action, trainer move contracts, opening progress surfaces, keyboard-operable board behavior, reduced-motion CSS, and the existing ChessIQ accessibility checks. The production quality gate also runs TypeScript checking and the app production build.

### Runtime accessibility pass

The existing Chromium accessibility workflow remains the runtime gate for keyboard focus and reduced-motion behavior. Authenticated persistence is intentionally not fabricated by static test data; database-backed opening progress and SRS writes require a real signed-in user and the configured MySQL service.
