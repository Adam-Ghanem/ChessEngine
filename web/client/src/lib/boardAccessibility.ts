export type AccessiblePieceKind = "P" | "N" | "B" | "R" | "Q" | "K";
export type AccessiblePieceColor = "white" | "black";

const PIECE_NAMES: Record<AccessiblePieceKind, string> = {
  P: "pawn",
  N: "knight",
  B: "bishop",
  R: "rook",
  Q: "queen",
  K: "king",
};

type BoardSquareAriaLabelOptions = {
  piece?: {
    color: AccessiblePieceColor;
    kind: AccessiblePieceKind;
  };
  square: string;
  isSelected: boolean;
  isTarget: boolean;
  lastMoveState?: "from" | "to";
};

export function boardSquareAriaLabel({ piece, square, isSelected, isTarget, lastMoveState }: BoardSquareAriaLabelOptions) {
  const baseLabel = piece
    ? `${piece.color} ${PIECE_NAMES[piece.kind]} on ${square}`
    : `Empty ${square}`;
  const stateLabels: string[] = [];

  if (isSelected) stateLabels.push("selected");
  if (isTarget) stateLabels.push(piece ? "legal capture target" : "legal move target");
  if (lastMoveState === "from") stateLabels.push("previous move origin");
  if (lastMoveState === "to") stateLabels.push("previous move destination");

  return stateLabels.length ? `${baseLabel}, ${stateLabels.join(", ")}` : baseLabel;
}
