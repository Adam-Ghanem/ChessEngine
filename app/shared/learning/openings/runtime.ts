import { Chess } from "chess.js";
import { getOpeningById } from "../../openings/ecoCatalog";
import type { OpeningLesson, OpeningLessonStep } from "./types";

export type LessonMoveEvaluation = {
  kind: "correct" | "wrong" | "illegal";
  move: string;
  acceptedMoves: string[];
};

function replayToPly(openingNodeId: string, ply: number) {
  const node = getOpeningById(openingNodeId);
  if (!node) throw new Error(`Opening node not found: ${openingNodeId}`);
  if (!Number.isInteger(ply) || ply < 0 || ply > node.uci.length) throw new Error(`Invalid lesson ply ${ply} for ${openingNodeId}`);
  const chess = new Chess();
  for (const uci of node.uci.slice(0, ply)) {
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
    });
    if (!move) throw new Error(`Canonical opening move is illegal: ${uci}`);
  }
  return chess;
}

export function flattenLessonSteps(lesson: OpeningLesson) {
  return lesson.chapters.flatMap(chapter => chapter.steps);
}

export function getLessonStepPosition(step: OpeningLessonStep) {
  const chess = replayToPly(step.openingNodeId, step.ply);
  const legalMoves = chess.moves({ verbose: true }).map(move => `${move.from}${move.to}${move.promotion ?? ""}`);
  return { fen: chess.fen(), legalMoves };
}

export function evaluateLessonMove(step: OpeningLessonStep, uci: string): LessonMoveEvaluation {
  const acceptedMoves = [...(step.acceptedMoves ?? [])];
  const { legalMoves } = getLessonStepPosition(step);
  if (!legalMoves.includes(uci)) return { kind: "illegal", move: uci, acceptedMoves };
  if (acceptedMoves.includes(uci)) return { kind: "correct", move: uci, acceptedMoves };
  return { kind: "wrong", move: uci, acceptedMoves };
}

export function resumeLessonIndex(lesson: OpeningLesson, completedSteps: number) {
  const steps = flattenLessonSteps(lesson);
  if (!steps.length) return 0;
  const normalized = Number.isFinite(completedSteps) ? Math.trunc(completedSteps) : 0;
  return Math.max(0, Math.min(normalized, steps.length - 1));
}
