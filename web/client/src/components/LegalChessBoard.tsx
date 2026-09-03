import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";
import { sideToMove, moveTargets } from "@/engine/playState";
import type { PlayerSide } from "@/engine/playSide";
import type { PieceColor } from "@/types/analysis";
import "@/play.css";

const whiteFiles = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const whiteRanks = [8, 7, 6, 5, 4, 3, 2, 1] as const;
type BoardPiece = { color: PieceColor; kind: ChessPieceKind };
type PieceMotion = { piece: BoardPiece; from: string; to: string; key: number };

type LegalChessBoardProps = {
  fen: string;
  legalMoves: string[];
  disabled?: boolean;
  onMove: (uci: string) => void | Promise<void>;
  ariaLabel?: string;
  lastMove?: string | null;
  orientation?: PlayerSide;
};

function decodeFen(fen: string) {
  const board = new Map<string, BoardPiece>();
  fen.split(" ")[0].split("/").forEach((row, rowIndex) => {
    let fileIndex = 0;
    for (const token of row) {
      if (/\d/.test(token)) fileIndex += Number(token);
      else {
        board.set(`${whiteFiles[fileIndex]}${whiteRanks[rowIndex]}`, {
          color: token === token.toUpperCase() ? "white" : "black",
          kind: token.toUpperCase() as ChessPieceKind,
        });
        fileIndex += 1;
      }
    }
  });
  return board;
}

function boardAxes(orientation: PlayerSide) {
  if (orientation === "black") {
    return { files: [...whiteFiles].reverse(), ranks: [...whiteRanks].reverse() };
  }
  return { files: [...whiteFiles], ranks: [...whiteRanks] };
}

function squareOrigin(square: string, files: readonly string[], ranks: readonly number[]) {
  return {
    x: files.indexOf(square[0]) * 12.5,
    y: ranks.indexOf(Number(square[1])) * 12.5,
  };
}

function squareTravel(from: string, to: string, files: readonly string[], ranks: readonly number[]) {
  return {
    x: (files.indexOf(to[0]) - files.indexOf(from[0])) * 100,
    y: (ranks.indexOf(Number(to[1])) - ranks.indexOf(Number(from[1]))) * 100,
  };
}

export function LegalChessBoard({
  fen,
  legalMoves,
  disabled = false,
  onMove,
  ariaLabel = "Playable chess board",
  lastMove = null,
  orientation = "white",
}: LegalChessBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [motion, setMotion] = useState<PieceMotion | null>(null);
  const previousBoardRef = useRef<Map<string, BoardPiece> | null>(null);
  const motionKeyRef = useRef(0);
  const board = useMemo(() => decodeFen(fen), [fen]);
  const { files, ranks } = useMemo(() => boardAxes(orientation), [orientation]);
  const turn = sideToMove(fen);
  const targets = useMemo(() => selected ? moveTargets(legalMoves, selected) : [], [legalMoves, selected]);

  useLayoutEffect(() => {
    const previousBoard = previousBoardRef.current;
    if (previousBoard && lastMove && lastMove.length >= 4) {
      const from = lastMove.slice(0, 2);
      const to = lastMove.slice(2, 4);
      const previousPiece = previousBoard.get(from);
      const destinationPiece = board.get(to);

      if (previousPiece && destinationPiece?.color === previousPiece.color) {
        setMotion({ piece: previousPiece, from, to, key: ++motionKeyRef.current });
      }
    } else if (!lastMove) {
      setMotion(null);
    }
    previousBoardRef.current = board;
  }, [board, lastMove]);

  useLayoutEffect(() => setSelected(null), [fen, orientation]);

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

  const motionOrigin = motion ? squareOrigin(motion.from, files, ranks) : null;
  const motionTravel = motion ? squareTravel(motion.from, motion.to, files, ranks) : null;

  return (
    <div className="play-board" role="grid" aria-label={ariaLabel} data-orientation={orientation}>
      {ranks.map((rank, row) => files.map((file, column) => {
        const square = `${file}${rank}`;
        const piece = board.get(square);
        const isSelected = square === selected;
        const isTarget = targets.includes(square);
        const isMotionDestination = square === motion?.to;
        return (
          <button
            key={square}
            type="button"
            role="gridcell"
            className={`play-square ${(row + column) % 2 === 0 ? "is-light" : "is-dark"} ${isSelected ? "is-selected" : ""} ${isTarget ? "is-target" : ""} ${isMotionDestination ? "is-motion-destination" : ""}`}
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

      {motion && motionOrigin && motionTravel && (
        <div
          key={motion.key}
          className="play-moving-piece"
          style={{
            left: `${motionOrigin.x}%`,
            top: `${motionOrigin.y}%`,
            ["--play-move-x" as string]: `${motionTravel.x}%`,
            ["--play-move-y" as string]: `${motionTravel.y}%`,
          }}
          onAnimationEnd={() => setMotion(current => current?.key === motion.key ? null : current)}
          aria-hidden="true"
        >
          <ChessPiece color={motion.piece.color} kind={motion.piece.kind} />
        </div>
      )}
    </div>
  );
}
