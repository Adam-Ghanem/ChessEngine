import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { PUZZLES } from "../client/src/lib/puzzleCatalog";

const enginePath = resolve(process.cwd(), "api/bin/ChessEngine");

for (const puzzle of PUZZLES) {
  if (puzzle.solution.length === 0) throw new Error(`Puzzle ${puzzle.id} has an empty solution line`);
  if (puzzle.solution.length % 2 === 0) {
    throw new Error(`Puzzle ${puzzle.id} must end on the solver's move`);
  }

  const commands = [`position fen ${puzzle.fen}`];
  for (const move of puzzle.solution) {
    commands.push("legalmoves", `play ${move}`);
  }
  commands.push("quit");

  const result = spawnSync(enginePath, [], { input: `${commands.join("\n")}\n`, encoding: "utf8" });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`ChessEngine verification failed for ${puzzle.id}: ${result.stderr || result.stdout}`);
  }

  const outputLines = result.stdout.split(/\r?\n/);
  const legalLines = outputLines.filter((line) => line.startsWith("legalmoves"));
  const playOkLines = outputLines.filter((line) => line.startsWith("playok "));

  if (legalLines.length !== puzzle.solution.length || playOkLines.length !== puzzle.solution.length) {
    throw new Error(`ChessEngine did not verify every move for ${puzzle.id}`);
  }

  puzzle.solution.forEach((move, index) => {
    const legalMoves = legalLines[index].split(/\s+/).slice(1);
    if (!legalMoves.includes(move)) {
      throw new Error(`Puzzle ${puzzle.id} has illegal move ${move} at ply ${index + 1}`);
    }
  });
}

console.log(`Verified ${PUZZLES.length} ChessIQ puzzles and every curated solution move with first-party ChessEngine.`);
