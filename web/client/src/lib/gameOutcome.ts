import type { StoredGame } from "./gameHistory";

function winnerLabel(game: StoredGame) {
  if (game.result === "white-win") return "White wins";
  if (game.result === "black-win") return "Black wins";
  return "Draw";
}

export function gameOutcomeLabel(game: StoredGame) {
  if (game.termination === "resignation") return `${winnerLabel(game)} · Resignation`;
  if (game.termination === "timeout") return `${winnerLabel(game)} · Time`;
  if (game.termination === "checkmate") return `${winnerLabel(game)} · Checkmate`;
  if (game.termination === "stalemate") return "Draw · Stalemate";
  if (game.termination === "draw") return "Draw";
  if (game.status === "checkmate") return "Checkmate";
  if (game.status === "stalemate") return "Stalemate";
  if (game.status === "draw") return "Draw";
  if (game.status === "check") return "In check";
  return "In progress";
}
