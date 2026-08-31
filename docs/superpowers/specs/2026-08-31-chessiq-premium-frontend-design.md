# ChessIQ Premium Frontend Design

## Goal

Turn the current ChessIQ web app into a cohesive, premium chess product while preserving the existing first-party C++ ChessEngine and the current working product flows. Phase 1 focuses on the global product shell, Play, Analyze, and responsive behavior.

## Product Principles

- ChessIQ must feel like one product, not a collection of unrelated pages.
- Preserve existing working game, analysis, authentication, and engine flows.
- Prefer incremental UI upgrades over a full rewrite.
- Keep the first-party C++ ChessEngine as the core engine.
- Remove production-facing placeholder copy such as "next product increment", "pending", or "local sample" from primary user flows.
- Desktop should feel information-dense and professional; mobile should be purpose-built rather than a squeezed desktop layout.
- Dark and light themes remain supported.

## Information Architecture

The main product navigation is:

1. Play
2. Analyze
3. Puzzles
4. Learn
5. Games
6. Progress
7. Coach

`/` and `/play` remain the primary entry point. `/analyze` becomes the canonical analysis workspace. The legacy `/review` experience is not removed immediately; its strongest review components are reused or migrated into `/analyze` before any route cleanup.

## Global Product Shell

### Header

Create a consistent premium header used across product pages:

- ChessIQ brand mark at the left.
- Primary navigation in the center/available desktop space.
- Theme control and account state/actions on the right.
- Clear active-route treatment.
- Responsive collapse for tablet/mobile.

The header must not contain generic template labels or placeholder navigation.

### Visual System

Use the existing design tokens where practical, but tighten them into a consistent system:

- Dark surface-first UI with crisp contrast and restrained accent usage.
- Light mode remains fully usable.
- Strong typography hierarchy for page titles, board status, evaluation values, and move data.
- Rounded surfaces should be subtle and consistent, not excessive.
- Motion should clarify state changes, not decorate every element.
- Avoid copying Chess.com or Lichess visual identity directly; ChessIQ should have its own premium technical identity.

## Play Workspace

The Play page should become a real chess cockpit rather than a generic form layout.

### Desktop layout

- Main board area is visually dominant.
- Player/status information sits close to the board.
- New-game controls and recent games live in a focused side rail.
- Important game state (side to move, mode, ply count, status) is visible without reading paragraphs.
- Existing local/computer modes and persisted games stay functional.

### Mobile layout

- Board uses the full safe width.
- New-game and recent-game controls stack below the board.
- Navigation and account actions collapse cleanly.
- No horizontal scrolling for normal gameplay.

## Analyze Workspace

`/analyze` becomes the flagship ChessIQ experience.

### Core layout

- Large board with evaluation bar.
- Analysis rail containing engine result, score/depth, principal variation, explanation, and review controls.
- Evaluation graph and move navigation are presented as part of the analysis flow.
- Move classifications and critical moments from the richer `/review` implementation are reused where they can be connected safely.
- PGN import remains available and should look like a first-class workflow rather than a detached utility block.

### Behavior

- Existing saved-game selection remains functional.
- Existing `trpc.analysis.analyze` flow remains the source of real ChessEngine analysis.
- The richer sample-review components may appear only when backed by real game state or clearly identified internal/demo data; production copy must not imply fake data is a live analysis result.
- Analysis loading, empty, error, and completed states must all have deliberate UI treatments.

## Responsive Rules

- Desktop: two-column play/analyze workspaces with board-first hierarchy.
- Tablet: board first, side rail moves below when width becomes constrained.
- Mobile: single-column layouts; board remains the first interactive object.
- Header navigation must remain usable without clipping.
- Controls must meet comfortable touch target sizing.

## Accessibility

- Preserve semantic buttons/links.
- Maintain visible focus states.
- All icon-only controls require accessible labels.
- Active navigation must expose `aria-current` where applicable.
- Color cannot be the only signal for engine/classification state.

## Data Flow and Boundaries

- `ProductHeader` owns product navigation/account/theme presentation only.
- `PlayPage` continues to consume `games.list`, `games.create`, and `games.move` through tRPC.
- `AnalyzePage` continues to consume saved games, PGN import, and analysis tRPC calls.
- Board rendering remains encapsulated in existing board components.
- Review-specific UI should be extracted/reused rather than duplicating engine/game state logic.
- No engine replacement or backend protocol redesign is part of this phase.

## Error and Empty States

- Signed-out users get a polished authentication gate with a single primary action.
- Empty Play state clearly offers creation of a new game.
- Empty Analyze state points users to play or import a game.
- Engine mutation errors continue to surface through toast/error UI, but critical state should also remain understandable in-page.
- Loading states should avoid layout jumps around the board.

## Testing Strategy

Phase 1 is complete only when:

- Existing frontend typecheck/build/tests still pass.
- Navigation routes render without runtime errors.
- Play create/select/move flows still work.
- Analyze saved-game selection, PGN import, and engine analysis flows still work.
- Desktop and mobile layouts are visually checked.
- No obvious placeholder/pending copy remains in the upgraded Play and Analyze primary surfaces.
- Vercel preview/production deployment succeeds before promotion.

## Phase 1 Scope

Included:

- ProductHeader and global navigation polish.
- Play page redesign.
- Analyze page redesign.
- Shared responsive/layout styling needed by those pages.
- Reuse/migration of appropriate review components.
- Frontend tests/verification directly required by these changes.

Deferred to later phases:

- Puzzles redesign.
- Learn redesign.
- Games redesign.
- Progress redesign.
- Coach redesign.
- Multiplayer infrastructure.
- Rating/matchmaking systems.
- Engine architecture changes unrelated to presenting existing analysis.
