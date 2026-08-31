export type PuzzleMoveEvaluation = {
  accepted: boolean;
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
