import { useEffect, useMemo, useState } from "react";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";
import { moveTargets, sideToMove } from "@/engine/playState";
import type { PieceColor } from "@/types/analysis";
import "@/play.css";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
type BoardPiece = { color: PieceColor; kind: ChessPieceKind };

type LegalChessBoardProps = {
  fen: string;
  legalMoves: string[];
  disabled?: boolean;
  onMove: (uci: string) => void | Promise<void>;
  ariaLabel?: string;
};

function decodeFen(fen: string) {
  const board = new Map<string, BoardPiece>();
  fen.split(" ")[0].split("/").forEach((row, rowIndex) => {
    let fileIndex = 0;
    for (const token of row) {
      if (/\d/.test(token)) fileIndex += Number(token);
      else {
        board.set(`${files[fileIndex]}${ranks[rowIndex]}`, {
          color: token === token.toUpperCase() ? "white" : "black",
          kind: token.toUpperCase() as ChessPieceKind,
        });
        fileIndex += 1;
      }
    }
  });
  return board;
}

export function LegalChessBoard({ fen, legalMoves, disabled = false, onMove, ariaLabel = "Playable chess board" }: LegalChessBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const board = useMemo(() => decodeFen(fen), [fen]);
  const turn = sideToMove(fen);
  const targets = useMemo(() => selected ? moveTargets(legalMoves, selected) : [], [legalMoves, selected]);

  useEffect(() => setSelected(null), [fen]);

  async function chooseSquare(square: string) {
    if (disabled) return;
    const piece = board.get(square);
    if (!selected) {
      if (piece?.color === turn && legalMoves.some(move => move.startsWith(square))) setSelected(square);
      return;
    }
    if (piece?.color === turn) {
      setSelected(legalMoves.some(move => move.startsWith(square)) ? square : null);
      return;
    }
    if (!targets.includes(square)) {
      setSelected(null);
      return;
    }

    const movingPiece = board.get(selected);
    const promotion = movingPiece?.kind === "P" && (square.endsWith("1") || square.endsWith("8")) ? "q" : "";
    const move = `${selected}${square}${promotion}`;
    setSelected(null);
    await onMove(move);
  }

  return (
    <div className="play-board" role="grid" aria-label={ariaLabel}>
      {ranks.map((rank, row) => files.map((file, column) => {
        const square = `${file}${rank}`;
        const piece = board.get(square);
        const isSelected = square === selected;
        const isTarget = targets.includes(square);
        return (
          <button
            key={square}
            type="button"
            role="gridcell"
            className={`play-square ${(row + column) % 2 === 0 ? "is-light" : "is-dark"} ${isSelected ? "is-selected" : ""} ${isTarget ? "is-target" : ""}`}
            onClick={() => chooseSquare(square)}
            aria-label={piece ? `${piece.color} ${piece.kind} on ${square}` : `Empty ${square}`}
            aria-pressed={isSelected}
            disabled={disabled}
          >
            {piece && <ChessPiece color={piece.color} kind={piece.kind} />}
            {isTarget && <span className="play-target" aria-hidden="true" />}
            {column === 0 && <span className="rank-label">{rank}</span>}
            {row === 7 && <span className="file-label">{file}</span>}
          </button>
        );
      }))}
    </div>
  );
}
