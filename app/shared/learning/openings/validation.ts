import { Chess } from "chess.js";
import { getOpeningById } from "../../openings/ecoCatalog";
import type { BoardAnnotation, OpeningLesson } from "./types";

const SQUARE = /^[a-h][1-8]$/;
const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const PLACEHOLDER = /\b(?:TODO|TBD|learn this opening|placeholder)\b/i;

function annotationErrors(annotation: BoardAnnotation, prefix: string) {
  const errors: string[] = [];
  if (annotation.kind === "arrow") {
    if (!SQUARE.test(annotation.from) || !SQUARE.test(annotation.to)) errors.push(`${prefix}: invalid arrow square`);
  } else if (annotation.kind === "candidate-move") {
    if (!UCI.test(annotation.move)) errors.push(`${prefix}: invalid candidate move`);
  } else if (!annotation.squares.length || annotation.squares.some(square => !SQUARE.test(square))) {
    errors.push(`${prefix}: invalid annotation squares`);
  }
  if (!annotation.label.trim()) errors.push(`${prefix}: annotation label is empty`);
  return errors;
}

function legalMovesAt(nodeId: string, ply: number) {
  const node = getOpeningById(nodeId);
  if (!node) return null;
  const chess = new Chess();
  try {
    for (const move of node.uci.slice(0, ply)) {
      chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] as "q" | "r" | "b" | "n" | undefined });
    }
  } catch {
    return null;
  }
  return new Set(chess.moves({ verbose: true }).map(move => `${move.from}${move.to}${move.promotion ?? ""}`));
}

export function validateOpeningLessons(lessons: readonly OpeningLesson[]) {
  const errors: string[] = [];
  if (lessons.length !== 100) errors.push(`catalog: expected 100 lessons, received ${lessons.length}`);

  const keys = new Set<string>();
  const slugs = new Set<string>();
  const familyCounts = new Map<string, number>();

  for (const lesson of lessons) {
    const prefix = lesson.key;
    if (keys.has(lesson.key)) errors.push(`${prefix}: duplicate key`);
    if (slugs.has(lesson.slug)) errors.push(`${prefix}: duplicate slug`);
    keys.add(lesson.key);
    slugs.add(lesson.slug);
    familyCounts.set(lesson.family, (familyCounts.get(lesson.family) ?? 0) + 1);

    if (PLACEHOLDER.test(`${lesson.title} ${lesson.summary}`)) errors.push(`${prefix}: placeholder lesson copy`);
    if (lesson.summary.trim().length < 60) errors.push(`${prefix}: summary is too thin`);
    if (lesson.chapters.length < 3 || lesson.chapters.length > 6) errors.push(`${prefix}: chapter count outside 3-6`);

    const node = getOpeningById(lesson.openingNodeId);
    if (!node) errors.push(`${prefix}: missing canonical opening node ${lesson.openingNodeId}`);

    const chapterIds = new Set<string>();
    const stepIds = new Set<string>();
    const steps = lesson.chapters.flatMap(chapter => {
      if (chapterIds.has(chapter.id)) errors.push(`${prefix}: duplicate chapter id ${chapter.id}`);
      chapterIds.add(chapter.id);
      return chapter.steps;
    });

    if (steps.length < 8 || steps.length > 20) errors.push(`${prefix}: step count outside 8-20`);
    if (steps.filter(step => step.kind === "checkpoint").length < 2) errors.push(`${prefix}: fewer than two checkpoints`);
    if (!steps.some(step => step.learningPoint === "plan")) errors.push(`${prefix}: missing strategic plan step`);
    if (!steps.some(step => step.learningPoint === "mistake" || step.learningPoint === "trap")) errors.push(`${prefix}: missing mistake/trap step`);
    if (!steps.some(step => step.learningPoint === "pawn-structure" || step.learningPoint === "key-square")) errors.push(`${prefix}: missing structure/key-square step`);

    for (const step of steps) {
      const stepPrefix = `${prefix}/${step.id}`;
      if (stepIds.has(step.id)) errors.push(`${stepPrefix}: duplicate step id`);
      stepIds.add(step.id);
      if (!step.title.trim() || step.body.trim().length < 24 || PLACEHOLDER.test(`${step.title} ${step.body}`)) errors.push(`${stepPrefix}: weak or placeholder copy`);
      const stepNode = getOpeningById(step.openingNodeId);
      if (!stepNode) {
        errors.push(`${stepPrefix}: missing opening node`);
        continue;
      }
      if (!Number.isInteger(step.ply) || step.ply < 0 || step.ply > stepNode.uci.length) errors.push(`${stepPrefix}: invalid ply ${step.ply}`);
      for (const annotation of step.annotations ?? []) errors.push(...annotationErrors(annotation, stepPrefix));
      if (step.kind === "checkpoint") {
        if (!step.acceptedMoves?.length || !step.feedback?.correct.trim() || !step.feedback?.incorrect.trim()) {
          errors.push(`${stepPrefix}: checkpoint is missing moves or feedback`);
          continue;
        }
        const legal = legalMovesAt(step.openingNodeId, step.ply);
        if (!legal) {
          errors.push(`${stepPrefix}: cannot reconstruct checkpoint position`);
          continue;
        }
        for (const move of step.acceptedMoves) if (!UCI.test(move) || !legal.has(move)) errors.push(`${stepPrefix}: illegal accepted move ${move}`);
      }
    }
  }

  for (const family of ["e4", "sicilian-defenses", "d4", "indian-defenses", "flank-and-systems"]) {
    if ((familyCounts.get(family) ?? 0) !== 20) errors.push(`${family}: expected 20 courses, received ${familyCounts.get(family) ?? 0}`);
  }
  return errors;
}
