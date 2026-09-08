import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";

export type OpeningBoardWorkspaceProps = {
  fen: string;
  orientation?: "white" | "black";
  activeMove?: string | null;
  expectedMove?: string | null;
  interactive?: boolean;
  onMove?: (uci: string) => void;
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function pieceKind(type: string): ChessPieceKind {
  return type.toUpperCase() as ChessPieceKind;
}

export function OpeningBoardWorkspace({
  fen,
  orientation = "white",
  activeMove,
  expectedMove,
  interactive = false,
  onMove,
}: OpeningBoardWorkspaceProps) {
  const chess = useMemo(() => new Chess(fen), [fen]);
  const [selected, setSelected] = useState<Square | null>(null);
  const files = orientation === "white" ? FILES : [...FILES].reverse();
  const ranks = orientation === "white" ? [...RANKS].reverse() : RANKS;
  const legalTargets = useMemo(() => {
    if (!selected) return new Set<Square>();
    return new Set(chess.moves({ square: selected, verbose: true }).map(move => move.to));
  }, [chess, selected]);

  const selectSquare = (square: Square) => {
    if (!interactive || !onMove) return;
    const piece = chess.get(square);
    if (!selected) {
      if (piece && piece.color === chess.turn()) setSelected(square);
      return;
    }
    if (square === selected) {
      setSelected(null);
      return;
    }
    if (legalTargets.has(square)) {
      const moves = chess.moves({ square: selected, verbose: true }).filter(move => move.to === square);
      const candidate = moves.find(move => move.promotion === "q") ?? moves[0];
      if (candidate) onMove(`${candidate.from}${candidate.to}${candidate.promotion ?? ""}`);
      setSelected(null);
      return;
    }
    if (piece && piece.color === chess.turn()) setSelected(square);
    else setSelected(null);
  };

  const activeSquares = new Set([activeMove?.slice(0, 2), activeMove?.slice(2, 4)].filter(Boolean));
  const expectedSquares = new Set([expectedMove?.slice(0, 2), expectedMove?.slice(2, 4)].filter(Boolean));

  return (
    <div className="opening-board-frame">
      <div className="opening-board-grid" role="grid" aria-label={`Chess opening board, ${orientation} orientation`}>
        {ranks.flatMap((rank, rowIndex) => files.map((file, columnIndex) => {
          const square = `${file}${rank}` as Square;
          const piece = chess.get(square);
          const light = (FILES.indexOf(file) + rank) % 2 === 1;
          const isSelected = selected === square;
          const isLegal = legalTargets.has(square);
          const isActive = activeSquares.has(square);
          const isExpected = expectedSquares.has(square);
          return (
            <button
              type="button"
              role="gridcell"
              key={square}
              className={`opening-square ${light ? "is-light" : "is-dark"} ${isSelected ? "is-selected" : ""} ${isLegal ? "is-legal" : ""} ${isActive ? "is-active-move" : ""} ${isExpected ? "is-expected" : ""}`}
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : " empty"}`}
              onClick={() => selectSquare(square)}
            >
              {piece ? <ChessPiece color={piece.color === "w" ? "white" : "black"} kind={pieceKind(piece.type)} /> : null}
              {isLegal ? <span className="opening-legal-dot" aria-hidden="true" /> : null}
              {columnIndex === 0 ? <span className="opening-rank-label" aria-hidden="true">{rank}</span> : null}
              {rowIndex === 7 ? <span className="opening-file-label" aria-hidden="true">{file}</span> : null}
            </button>
          );
        }))}
      </div>
    </div>
  );
}
