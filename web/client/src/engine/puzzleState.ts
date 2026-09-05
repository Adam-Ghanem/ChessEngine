export type PuzzleMoveEvaluation = {
  accepted: boolean;
  solved: boolean;
  nextIndex: number;
};

export type PuzzleAutoReply = {
  move: string | null;
  solved: boolean;
  nextIndex: number;
};

export function evaluatePuzzleMove(solution: string[], index: number, move: string): PuzzleMoveEvaluation {
  if (solution[index] !== move) {
    return { accepted: false, solved: false, nextIndex: index };
  }
  const nextIndex = index + 1;
  return { accepted: true, solved: nextIndex >= solution.length, nextIndex };
}

export function nextPuzzleAutoReply(solution: string[], index: number): PuzzleAutoReply {
  const move = solution[index] ?? null;
  if (!move) return { move: null, solved: true, nextIndex: index };
  const nextIndex = index + 1;
  return { move, solved: nextIndex >= solution.length, nextIndex };
}
