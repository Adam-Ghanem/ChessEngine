import { Chess } from "chess.js";

export const STARTING_FEN = new Chess().fen();

export function restoreChess(initialFen: string, moves: string[]) {
  const chess = new Chess(initialFen);
  for (const uci of moves) {
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as "q" | "r" | "b" | "n" | undefined });
  }
  return chess;
}

export function gameSummary(initialFen: string, moves: string[]) {
  const chess = restoreChess(initialFen, moves);
  return { fen: chess.fen(), pgn: chess.pgn(), turn: chess.turn(), isGameOver: chess.isGameOver(), history: chess.history() };
}
