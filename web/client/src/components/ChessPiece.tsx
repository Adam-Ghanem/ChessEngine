/**
 * ChessIQ chess pieces: CC0 Meridian Shaded SVG assets by Martin Sedlák, used as a coherent replacement for hand-drawn silhouettes.
 * Source: https://github.com/kmar/chess_svg_piece_sets
 */
import type { PieceColor } from "@/types/analysis";

export type ChessPieceKind = "K" | "Q" | "R" | "B" | "N" | "P";
interface ChessPieceProps { color: PieceColor; kind: ChessPieceKind; className?: string; }

const pieceAssets: Record<PieceColor, Record<ChessPieceKind, string>> = {
  black: { B: "/manus-storage/bb_38e24902.svg", K: "/manus-storage/bk_864daf7a.svg", N: "/manus-storage/bn_fa1614bf.svg", P: "/manus-storage/bp_b6d40493.svg", Q: "/manus-storage/bq_d33b0b2c.svg", R: "/manus-storage/br_1b48ed41.svg" },
  white: { B: "/manus-storage/wb_397bd9a9.svg", K: "/manus-storage/wk_5f1c8489.svg", N: "/manus-storage/wn_ddfefbf5.svg", P: "/manus-storage/wp_49b4863d.svg", Q: "/manus-storage/wq_586beb28.svg", R: "/manus-storage/wr_ceaf83bb.svg" },
};

export function ChessPiece({ color, kind, className = "" }: ChessPieceProps) {
  return <img className={`chess-piece chess-piece-asset ${className}`} src={pieceAssets[color][kind]} alt="" draggable="false" aria-hidden="true" />;
}
