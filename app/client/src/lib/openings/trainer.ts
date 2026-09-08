import { Chess } from "chess.js";

export type TrainerPosition = {
  fen: string;
  canonicalMove: string;
  acceptableMoves: readonly string[];
};

export type TrainerMoveResult = {
  kind: "correct" | "acceptable" | "wrong" | "illegal";
  canonicalMove: string;
};

export function evaluateTrainerMove(position: TrainerPosition, uci: string): TrainerMoveResult {
  const chess = new Chess(position.fen);
  let move;
  try {
    move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
    });
  } catch {
    move = null;
  }
  if (!move) return { kind: "illegal", canonicalMove: position.canonicalMove };
  const played = `${move.from}${move.to}${move.promotion ?? ""}`;
  if (played === position.canonicalMove) return { kind: "correct", canonicalMove: position.canonicalMove };
  if (position.acceptableMoves.includes(played)) return { kind: "acceptable", canonicalMove: position.canonicalMove };
  return { kind: "wrong", canonicalMove: position.canonicalMove };
}

export type TrainerQueueItem = {
  id: string;
  overdueDays: number;
  masteryScore: number;
  lapses: number;
};

export function sortTrainerSessionQueue<T extends TrainerQueueItem>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    b.overdueDays - a.overdueDays ||
    a.masteryScore - b.masteryScore ||
    b.lapses - a.lapses ||
    a.id.localeCompare(b.id)
  );
}

export function trainerOrientation(side: "white" | "black") {
  return side;
}
