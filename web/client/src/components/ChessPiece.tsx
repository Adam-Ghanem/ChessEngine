/**
 * ChessIQ chess pieces: CC0 Meridian Shaded SVG assets by Martin Sedlák, used as a coherent replacement for hand-drawn silhouettes.
 * Source: https://github.com/kmar/chess_svg_piece_sets
 */
import type { PieceColor } from "@/types/analysis";

export type ChessPieceKind = "K" | "Q" | "R" | "B" | "N" | "P";
interface ChessPieceProps { color: PieceColor; kind: ChessPieceKind; className?: string; }

const pieceAssets: Record<PieceColor, Record<ChessPieceKind, string>> = {
  black: { B: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/bb.svg", K: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/bk.svg", N: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/bn.svg", P: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/bp.svg", Q: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/bq.svg", R: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/br.svg" },
  white: { B: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/wb.svg", K: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/wk.svg", N: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/wn.svg", P: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/wp.svg", Q: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/wq.svg", R: "https://raw.githubusercontent.com/kmar/chess_svg_piece_sets/main/meridian_shaded/wr.svg" },
};

export function ChessPiece({ color, kind, className = "" }: ChessPieceProps) {
  return <img className={`chess-piece chess-piece-asset ${className}`} src={pieceAssets[color][kind]} alt="" draggable="false" aria-hidden="true" />;
}
