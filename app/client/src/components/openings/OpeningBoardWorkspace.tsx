import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";
import { ChessPiece, type ChessPieceKind } from "@/components/ChessPiece";
import type { BoardAnnotation } from "@shared/learning/openings";

export type OpeningBoardWorkspaceProps = {
  fen: string;
  orientation?: "white" | "black";
  activeMove?: string | null;
  expectedMove?: string | null;
  interactive?: boolean;
  annotations?: BoardAnnotation[];
  onMove?: (uci: string) => void;
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type AnnotationSquareState = {
  highlight: boolean;
  zone: boolean;
  pawnStructure: boolean;
};

function pieceKind(type: string): ChessPieceKind {
  return type.toUpperCase() as ChessPieceKind;
}

function squareCenter(square: string, orientation: "white" | "black") {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return null;
  const displayFile = orientation === "white" ? fileIndex : 7 - fileIndex;
  const displayRank = orientation === "white" ? 8 - rank : rank - 1;
  return {
    x: displayFile * 12.5 + 6.25,
    y: displayRank * 12.5 + 6.25,
  };
}

function arrowAnnotations(annotations: BoardAnnotation[]) {
  return annotations.flatMap(annotation => {
    if (annotation.kind === "arrow") return [annotation];
    if (annotation.kind === "candidate-move") {
      return [{
        kind: "arrow" as const,
        from: annotation.move.slice(0, 2),
        to: annotation.move.slice(2, 4),
        label: annotation.label,
      }];
    }
    return [];
  });
}

export function OpeningBoardWorkspace({
  fen,
  orientation = "white",
  activeMove,
  expectedMove,
  interactive = false,
  annotations = [],
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

  const annotationSquares = useMemo(() => {
    const states = new Map<string, AnnotationSquareState>();
    const mark = (square: string, field: keyof AnnotationSquareState) => {
      const current = states.get(square) ?? { highlight: false, zone: false, pawnStructure: false };
      states.set(square, { ...current, [field]: true });
    };

    for (const annotation of annotations) {
      if (annotation.kind === "arrow") continue;
      if (annotation.kind === "candidate-move") {
        mark(annotation.move.slice(0, 2), "highlight");
        mark(annotation.move.slice(2, 4), "highlight");
        continue;
      }
      for (const square of annotation.squares) {
        if (annotation.kind === "zone") mark(square, "zone");
        else if (annotation.kind === "pawn-structure") mark(square, "pawnStructure");
        else mark(square, "highlight");
      }
    }
    return states;
  }, [annotations]);

  const lessonArrows = useMemo(() => arrowAnnotations(annotations), [annotations]);

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
      <div
        className="opening-board-grid"
        role="grid"
        aria-label={`Chess opening board, ${orientation} orientation`}
        style={{ position: "relative" }}
      >
        {ranks.flatMap((rank, rowIndex) => files.map((file, columnIndex) => {
          const square = `${file}${rank}` as Square;
          const piece = chess.get(square);
          const light = (FILES.indexOf(file) + rank) % 2 === 1;
          const isSelected = selected === square;
          const isLegal = legalTargets.has(square);
          const isActive = activeSquares.has(square);
          const isExpected = expectedSquares.has(square);
          const annotationState = annotationSquares.get(square);
          const isLessonHighlight = Boolean(annotationState?.highlight);
          const isLessonZone = Boolean(annotationState?.zone);
          const isPawnStructure = Boolean(annotationState?.pawnStructure);
          const lessonStyle = isLessonZone
            ? { backgroundImage: "linear-gradient(rgba(62, 208, 181, .16), rgba(62, 208, 181, .16))" }
            : isPawnStructure
              ? { boxShadow: "inset 0 0 0 3px rgba(235, 181, 75, .78)" }
              : isLessonHighlight
                ? { boxShadow: "inset 0 0 0 3px rgba(137, 104, 255, .78)" }
                : undefined;
          return (
            <button
              type="button"
              role="gridcell"
              key={square}
              className={`opening-square ${light ? "is-light" : "is-dark"} ${isSelected ? "is-selected" : ""} ${isLegal ? "is-legal" : ""} ${isActive ? "is-active-move" : ""} ${isExpected ? "is-expected" : ""} ${isLessonHighlight ? "is-lesson-highlight" : ""} ${isLessonZone ? "is-lesson-zone" : ""} ${isPawnStructure ? "is-pawn-structure" : ""}`}
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : " empty"}`}
              onClick={() => selectSquare(square)}
              style={lessonStyle}
            >
              {piece ? <ChessPiece color={piece.color === "w" ? "white" : "black"} kind={pieceKind(piece.type)} /> : null}
              {isLegal ? <span className="opening-legal-dot" aria-hidden="true" /> : null}
              {columnIndex === 0 ? <span className="opening-rank-label" aria-hidden="true">{rank}</span> : null}
              {rowIndex === 7 ? <span className="opening-file-label" aria-hidden="true">{file}</span> : null}
            </button>
          );
        }))}

        {lessonArrows.length ? (
          <svg
            className="opening-board-annotations"
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            {/* pointer-events are disabled so square buttons remain the only interaction layer. */}
            <defs>
              <marker id="opening-lesson-arrow-head" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M0,0 L5,2.5 L0,5 z" fill="currentColor" />
              </marker>
            </defs>
            {lessonArrows.map((annotation, index) => {
              const from = squareCenter(annotation.from, orientation);
              const to = squareCenter(annotation.to, orientation);
              if (!from || !to) return null;
              return (
                <line
                  key={`${annotation.from}-${annotation.to}-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="currentColor"
                  strokeWidth="1.55"
                  strokeLinecap="round"
                  opacity="0.8"
                  markerEnd="url(#opening-lesson-arrow-head)"
                />
              );
            })}
          </svg>
        ) : null}
      </div>

      {annotations.length ? (
        <div className="opening-annotation-legend" aria-label="Lesson board annotations">
          {annotations.map((annotation, index) => (
            <span key={`${annotation.kind}-${annotation.label}-${index}`}>{annotation.label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
