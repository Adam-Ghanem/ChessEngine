export function requiresNewGameConfirmation(moveCount: number, terminal: boolean) {
  return moveCount > 0 && !terminal;
}
