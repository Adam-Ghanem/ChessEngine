import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { PUZZLES } from "../client/src/lib/puzzleCatalog";

const enginePath = resolve(process.cwd(), "api/bin/ChessEngine");

for (const puzzle of PUZZLES) {
  const firstMove = puzzle.solution[0];
  if (!firstMove) throw new Error(`Puzzle ${puzzle.id} has an empty solution line`);

  const input = `position fen ${puzzle.fen}\nlegalmoves\nplay ${firstMove}\nquit\n`;
  const result = spawnSync(enginePath, [], { input, encoding: "utf8" });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`ChessEngine verification failed for ${puzzle.id}: ${result.stderr || result.stdout}`);
  }

  const legalLine = result.stdout.split(/\r?\n/).find((line) => line.startsWith("legalmoves"));
  const legalMoves = legalLine?.split(/\s+/).slice(1) ?? [];
  if (!legalMoves.includes(firstMove)) {
    throw new Error(`Puzzle ${puzzle.id} starts with illegal move ${firstMove}`);
  }
  if (!result.stdout.includes(`playok `)) {
    throw new Error(`ChessEngine refused puzzle ${puzzle.id} move ${firstMove}`);
  }
}

console.log(`Verified ${PUZZLES.length} ChessIQ puzzles with first-party ChessEngine.`);
