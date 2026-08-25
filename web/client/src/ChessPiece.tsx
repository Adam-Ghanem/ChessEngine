/**
 * ChessIQ chess pieces: a clean original flat tournament set with rounded silhouettes and one consistent dark outline.
 */
import type { PieceColor } from "@/types/analysis";

export type ChessPieceKind = "K" | "Q" | "R" | "B" | "N" | "P";
interface ChessPieceProps { color: PieceColor; kind: ChessPieceKind; className?: string; }

function PieceBody({ kind }: { kind: ChessPieceKind }) {
  switch (kind) {
    case "K": return <><path d="M46 9h8v10h10v7h-10v9c12 3 19 13 19 25 0 6-2 11-6 15h5v8H28v-8h5c-4-4-6-9-6-15 0-12 7-22 19-25v-9H36v-7h10V9Z" /><path d="M25 83h50c5 0 8 3 8 7v8H17v-8c0-4 3-7 8-7Z" /></>;
    case "Q": return <><path d="M22 22 34 42l8-22 8 22 8-22 8 22 12-20-4 42H26l-4-42Z" /><circle cx="22" cy="17" r="6" /><circle cx="36" cy="14" r="6" /><circle cx="50" cy="17" r="6" /><circle cx="64" cy="14" r="6" /><circle cx="78" cy="17" r="6" /><path d="M22 64h56c3 0 5 2 6 5l2 14H14l2-14c1-3 3-5 6-5Z" /><path d="M18 83h64v15H18z" /></>;
    case "R": return <><path d="M21 15h15v8h9v-8h10v8h9v-8h15v25H21V15Z" /><path d="M28 40h44l5 27H23l5-27Z" /><path d="M20 67h60c4 0 7 3 7 7v9H13v-9c0-4 3-7 7-7Z" /><path d="M18 83h64v15H18z" /></>;
    case "B": return <><path d="M50 12c13 0 20 11 16 25-2 8-8 13-16 17-8-4-14-9-16-17-4-14 3-25 16-25Z" /><path d="M40 20 61 45" className="piece-slit" /><path d="M40 53c-8 8-11 17-11 30h42c0-13-3-22-11-30-3-3-7-5-10-5s-7 2-10 5Z" /><path d="M21 83h58c4 0 7 3 7 7v8H14v-8c0-4 3-7 7-7Z" /></>;
    case "N": return <><path d="M63 15c-14 1-22 8-24 21l-7 17c-4 10-1 19 9 26h-8v4h42v-4h-6c7-8 9-17 5-29l-2-16c-1-11-3-18-9-19Z" /><path d="M58 23c6 2 10 7 11 13" className="piece-detail" /><circle cx="57" cy="36" r="2.8" className="piece-eye" /><path d="M20 83h60c4 0 7 3 7 7v8H13v-8c0-4 3-7 7-7Z" /></>;
    case "P": return <><circle cx="50" cy="27" r="16" /><path d="M39 46c-7 7-10 17-10 30h42c0-13-3-23-10-30-3-3-7-5-11-5s-8 2-11 5Z" /><path d="M20 76h60c4 0 7 3 7 7v15H13V83c0-4 3-7 7-7Z" /></>;
  }
}

export function ChessPiece({ color, kind, className = "" }: ChessPieceProps) {
  const fill = color === "white" ? "#f8f8f3" : "#55565b";
  return <svg className={`chess-piece ${className}`} viewBox="0 0 100 110" role="img" aria-hidden="true" focusable="false"><g className={`chess-piece-shape piece-${color}`} fill={fill} stroke="#2e2d33" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round"><PieceBody kind={kind} /></g></svg>;
}
