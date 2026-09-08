# ChessIQ canonical openings

ChessIQ keeps opening identity and trainer correctness local to the project. The factual ECO/name/PGN snapshot under `data/` is vendored from [`lichess-org/chess-openings`](https://github.com/lichess-org/chess-openings) at commit `4b8622759e7ae6f93f011cc6c83a3823401ab45e`.

That upstream dataset is dedicated to the public domain under CC0-1.0. ChessIQ deterministically generates TypeScript row modules under `generated/`, then uses `chess.js` to derive legal UCI sequences and normalized EPD positions.

Project-owned educational summaries, aliases, search behavior, hierarchy, SRS metadata, and trainer rules live in the surrounding ChessIQ modules. Lichess Opening Explorer live statistics are enrichment only; they never decide whether a trainer move is correct.

## Release invariants

- Every ECO code A00-E99 has at least one canonical line.
- Every UCI line replays legally from the initial position.
- IDs and slugs are unique.
- Parent lines are strict move-prefixes of their children.
- Every trainable continuation is legal from its node position.
- External statistics may fail without breaking the canonical explorer or trainer.
