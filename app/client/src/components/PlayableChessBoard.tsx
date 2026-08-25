import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";

type MoveInput = { from: string; to: string; promotion?: "q" | "r" | "b" | "n" };
type Props = { fen: string; onMove: (move: MoveInput) => void; disabled?: boolean; label?: string };
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

export function PlayableChessBoard({ fen, onMove, disabled = false, label = "Playable chessboard" }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const chess = useMemo(() => new Chess(fen), [fen]);
  const legalTargets = selected ? chess.moves({ square: selected as Square, verbose: true }).map(move => move.to) : [];

  function select(square: string) {
    if (disabled) return;
    const target = legalTargets.includes(square as Square);
    if (selected && target) {
      const piece = chess.get(selected as Square);
      if (piece?.type === "p" && ["1", "8"].includes(square[1])) {
        setPromotion({ from: selected, to: square });
        setSelected(null);
        return;
      }
      onMove({ from: selected, to: square });
      setSelected(null);
      return;
    }
    const piece = chess.get(square as Square);
    if (piece && piece.color === chess.turn()) setSelected(square);
    else setSelected(null);
  }

  return <div className="play-board-frame"><div className="play-board" role="grid" aria-label={label}>{ranks.map((rank, row) => files.map((file, col) => {
    const square = `${file}${rank}`;
    const piece = chess.get(square as Square);
    const light = (row + col) % 2 === 0;
    return <button key={square} type="button" role="gridcell" onClick={() => select(square)} className={`play-square ${light ? "is-light" : "is-dark"} ${selected === square ? "is-selected" : ""} ${legalTargets.includes(square as Square) ? "is-target" : ""}`} aria-label={piece ? `${piece.color === "w" ? "white" : "black"} ${piece.type} on ${square}` : `empty ${square}`}>
      {col === 0 && <span className="rank-label">{rank}</span>}{row === 7 && <span className="file-label">{file}</span>}
      {legalTargets.includes(square as Square) && <span className="legal-target" aria-hidden="true" />}
      {piece && <ChessPiece color={piece.color === "w" ? "white" : "black"} kind={piece.type.toUpperCase() as ChessPieceKind} />}
    </button>;
  }))}</div>{promotion && <div className="promotion-picker" role="dialog" aria-modal="true" aria-label="Choose a piece for promotion"><span>Promote pawn to</span><div>{(["q", "r", "b", "n"] as const).map(kind => <button key={kind} type="button" onClick={() => { onMove({ ...promotion, promotion: kind }); setPromotion(null); }} aria-label={`Promote to ${kind === "q" ? "queen" : kind === "r" ? "rook" : kind === "b" ? "bishop" : "knight"}`}><ChessPiece color={chess.turn() === "w" ? "white" : "black"} kind={kind.toUpperCase() as ChessPieceKind} /></button>)}</div><button className="promotion-cancel" type="button" onClick={() => setPromotion(null)}>Cancel</button></div>}</div>;
}
