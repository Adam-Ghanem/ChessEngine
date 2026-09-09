/**
 * ChessIQ chess board: original vector pieces plus a single-source motion layer for moves, captures, castling, and promotions.
 * This component is presentation-only. Engine-backed interaction lives in LegalChessBoard.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import "@/chess-piece-motion.css";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";
import { nextBoardFocusSquare } from "@/lib/boardKeyboardNavigation";
import { classificationMeta, type MoveClassification, type PieceColor } from "@/types/analysis";
import "@/piece-marker.css";

interface ChessBoardProps { fen: string; lastMove: { from: string; to: string }; engineArrow: { from: string; to: string }; classification?: MoveClassification; showClassificationMarker?: boolean; }
type BoardPiece = { color: PieceColor; kind: ChessPieceKind };
type MotionPiece = { piece: BoardPiece; from: string; to: string; capture: boolean; promotion: boolean; key: number };

const PIECE_NAMES: Record<ChessPieceKind, string> = { K: "king", Q: "queen", R: "rook", B: "bishop", N: "knight", P: "pawn" };
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

function decodeFen(fen: string) {
  const position = new Map<string, BoardPiece>();
  fen.split(" ")[0].split("/").forEach((row, rowIndex) => {
    let fileIndex = 0;
    for (const token of row) {
      if (/\d/.test(token)) fileIndex += Number(token);
      else { const color: PieceColor = token === token.toUpperCase() ? "white" : "black"; const kind = token.toUpperCase() as ChessPieceKind; position.set(`${files[fileIndex]}${ranks[rowIndex]}`, { color, kind }); fileIndex += 1; }
    }
  });
  return position;
}

function squareCenter(square: string) { return { x: (files.indexOf(square[0]) + .5) * 12.5, y: (ranks.indexOf(Number(square[1])) + .5) * 12.5 }; }
function squareOrigin(square: string) { return { x: files.indexOf(square[0]) * 12.5, y: ranks.indexOf(Number(square[1])) * 12.5 }; }

const markerSymbols: Record<string, string> = { BRILLIANT: "!!", GREAT: "!", BEST: "✓", EXCELLENT: "✓", GOOD: "·", BOOK: "♟", INACCURACY: "?!", MISTAKE: "?", BLUNDER: "×" };

export function ChessBoard({ fen, lastMove, engineArrow, classification, showClassificationMarker = false }: ChessBoardProps) {
  const [motion, setMotion] = useState<MotionPiece | null>(null);
  const [focusedSquare, setFocusedSquare] = useState("a8");
  const motionKey = useRef(0);
  const priorPosition = useRef<Map<string, BoardPiece> | null>(null);
  const squareRefs = useRef(new Map<string, HTMLDivElement>());
  const position = useMemo(() => decodeFen(fen), [fen]);
  const start = squareCenter(engineArrow.from); const end = squareCenter(engineArrow.to);
  const movingPiece = position.get(lastMove.to);

  useEffect(() => {
    const previous = priorPosition.current;
    if (previous && movingPiece) {
      const previousDestination = previous.get(lastMove.to);
      setMotion({ piece: movingPiece, from: lastMove.from, to: lastMove.to, capture: Boolean(previousDestination && previousDestination.color !== movingPiece.color), promotion: movingPiece.kind === "P" && ["1", "8"].includes(lastMove.to[1]), key: ++motionKey.current });
    }
    priorPosition.current = position;
  }, [lastMove.from, lastMove.to, movingPiece, position]);

  function handleSquareKeyDown(event: KeyboardEvent<HTMLDivElement>, square: string) {
    const nextSquare = nextBoardFocusSquare(square, event.key, "white");
    if (!nextSquare) return;
    event.preventDefault();
    setFocusedSquare(nextSquare);
    squareRefs.current.get(nextSquare)?.focus();
  }

  const motionFrom = motion ? squareOrigin(motion.from) : null;
  const motionTo = motion ? squareOrigin(motion.to) : null;
  const isCastle = Boolean(motion && motion.piece.kind === "K" && Math.abs(files.indexOf(motion.from[0]) - files.indexOf(motion.to[0])) === 2);
  const castleRook = isCastle && motion ? { color: motion.piece.color, kind: "R" as const, from: motion.to[0] === "g" ? `h${motion.from[1]}` : `a${motion.from[1]}`, to: motion.to[0] === "g" ? `f${motion.from[1]}` : `d${motion.from[1]}` } : null;

  return <section className="board-instrument" aria-label="Chess position board"><div className="board-frame"><div className="chessboard" role="grid" aria-label="Chess position" aria-describedby="chess-position-keyboard-hint" aria-rowcount={8} aria-colcount={8}><svg className="engine-arrow-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="engine-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" /></marker></defs><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} markerEnd="url(#engine-arrowhead)" className="engine-arrow" /></svg>{ranks.map((rank, rowIndex) => files.map((file, columnIndex) => { const square = `${file}${rank}`; const piece = position.get(square); const lightSquare = (rowIndex + columnIndex) % 2 === 0; const isLastMove = square === lastMove.from || square === lastMove.to; const isArrival = Boolean(motion && square === motion.to); const hasMarker = Boolean(showClassificationMarker && classification && square === lastMove.to && piece); return <div key={square} ref={element => { if (element) squareRefs.current.set(square, element); else squareRefs.current.delete(square); }} className={`board-square ${lightSquare ? "is-light" : "is-dark"} ${isLastMove ? "is-last-move" : ""} ${isArrival ? "is-arrival" : ""}`} role="gridcell" tabIndex={square === focusedSquare ? 0 : -1} onFocus={() => setFocusedSquare(square)} onKeyDown={event => handleSquareKeyDown(event, square)} aria-label={piece ? `${piece.color} ${PIECE_NAMES[piece.kind]} on ${square}` : `Empty ${square}`}><>{columnIndex === 0 && <span className="rank-label">{rank}</span>}{rowIndex === 7 && <span className="file-label">{file}</span>}{piece && <ChessPiece color={piece.color} kind={piece.kind} className={isArrival ? "is-arriving" : ""} />}{hasMarker && <PieceClassificationMarker classification={classification!} />}</></div>; }))}
      {motion && motionFrom && motionTo && <div key={motion.key} className={`moving-piece ${motion.capture ? "is-capture" : ""} ${motion.promotion ? "is-promotion" : ""}`} style={{ left: `${motionFrom.x}%`, top: `${motionFrom.y}%`, ["--move-x" as string]: `${motionTo.x - motionFrom.x}%`, ["--move-y" as string]: `${motionTo.y - motionFrom.y}%` }} aria-hidden="true"><ChessPiece color={motion.piece.color} kind={motion.piece.kind} className="is-traveling" /></div>}
      {castleRook && <CastlingRook motionKey={motion?.key || 0} rook={castleRook} />}
      {motion?.capture && motionTo && <span key={`capture-${motion.key}`} className="capture-impact" style={{ left: `${motionTo.x}%`, top: `${motionTo.y}%` }} aria-hidden="true" />}
      {motion?.promotion && motionTo && <span key={`promotion-${motion.key}`} className="promotion-flare" style={{ left: `${motionTo.x}%`, top: `${motionTo.y}%` }} aria-hidden="true" />}
    </div></div><p className="board-hint" id="chess-position-keyboard-hint">Position display. Use the arrow keys to explore squares. The teal arrow marks the suggested continuation.</p></section>;
  }

function PieceClassificationMarker({ classification }: { classification: MoveClassification }) {
  const meta = classificationMeta[classification];
  return <span className={`piece-classification-marker marker-tone-${meta.tone}`} role="status" aria-label={`${meta.label} move`}>{markerSymbols[classification] ?? "•"}</span>;
}

function CastlingRook({ motionKey, rook }: { motionKey: number; rook: { color: PieceColor; kind: "R"; from: string; to: string } }) {
  const from = squareOrigin(rook.from); const to = squareOrigin(rook.to);
  return <div key={`rook-${motionKey}`} className="moving-piece moving-rook" style={{ left: `${from.x}%`, top: `${from.y}%`, ["--move-x" as string]: `${to.x - from.x}%`, ["--move-y" as string]: `${to.y - from.y}%` }} aria-hidden="true"><ChessPiece color={rook.color} kind="R" className="is-traveling" /></div>;
}