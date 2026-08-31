import type { PlayEngineStatus } from "./playEngine";

export type SideToMove = "white" | "black";

export function moveTargets(legalMoves: string[], square: string) {
  return legalMoves.filter(move => move.startsWith(square)).map(move => move.slice(2, 4));
}

export function sideToMove(fen: string): SideToMove {
  return fen.trim().split(/\s+/)[1] === "b" ? "black" : "white";
}

export function statusLabel(status: PlayEngineStatus, side: SideToMove) {
  if (status === "checkmate") return "Checkmate";
  if (status === "stalemate") return "Stalemate";
  if (status === "draw") return "Draw";
  const turn = side === "white" ? "White" : "Black";
  return status === "check" ? `${turn} to move · Check` : `${turn} to move`;
}
