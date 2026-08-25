# ChessIQ Functional Architecture

ChessIQ is transitioning from a visual analysis workstation into a signed-in chess product. The first functional release is deliberately local-first: a user can create and play a legal game against themselves or a computer response, save game state and PGN, request a bounded engine search, import/export PGN, follow lessons, attempt puzzles, and retain their own progress.

| Domain | Persistent record | Owner boundary | Functional behavior |
| --- | --- | --- | --- |
| Games | `games` | Creator only | Creates a game from the starting FEN, applies validated moves, tracks outcome, stores PGN and move history. |
| Analysis | `analysisSessions` | Game owner only | Saves a FEN, depth, best move, score, principal variation, and engine source. |
| Lessons | `lessonProgress` | Learner only | Stores a user’s started/completed state and checkpoints against curated lesson content. |
| Puzzles | `puzzleAttempts` | Learner only | Records a legal attempt, result, and completion timestamp. |

The existing C++ ChessEngine source is staged in `engine/` and built into a bounded UCI process for the production full-stack runtime. Every request supplies a validated FEN and a capped depth; the server never accepts shell command fragments or arbitrary executable paths. Browser play uses `chess.js` for legal-move validation and PGN generation, while the server repeats validation before persistence.

> The Vercel deployment remains a static visual preview. Authentication, persistence, and the C++ engine require the full-stack ChessIQ deployment because they need the managed database and a Node server capable of invoking the engine process.
