import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { getOpeningById } from "../../openings/ecoCatalog";
import { OPENING_LESSONS } from "./index";
import {
  evaluateLessonMove,
  flattenLessonSteps,
  getLessonStepPosition,
  resumeLessonIndex,
} from "./runtime";

const lesson = OPENING_LESSONS[0];
const steps = flattenLessonSteps(lesson);
const checkpoint = steps.find(step => step.kind === "checkpoint")!;

describe("opening lesson runtime", () => {
  it("flattens chapters in deterministic order", () => {
    expect(steps[0].id).toBe("identity");
    expect(steps.at(-1)?.id).toBe("recap");
  });

  it("reconstructs the exact canonical position at a step ply", () => {
    const node = getOpeningById(checkpoint.openingNodeId)!;
    const chess = new Chess();
    for (const uci of node.uci.slice(0, checkpoint.ply)) {
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as "q" | "r" | "b" | "n" | undefined });
    }
    expect(getLessonStepPosition(checkpoint).fen).toBe(chess.fen());
  });

  it("accepts an explicitly curated checkpoint move", () => {
    expect(evaluateLessonMove(checkpoint, checkpoint.acceptedMoves![0]).kind).toBe("correct");
  });

  it("marks a different legal move as wrong", () => {
    const { legalMoves } = getLessonStepPosition(checkpoint);
    const alternative = legalMoves.find(move => !checkpoint.acceptedMoves!.includes(move));
    expect(alternative).toBeTruthy();
    expect(evaluateLessonMove(checkpoint, alternative!).kind).toBe("wrong");
  });

  it("rejects an illegal move before checking course correctness", () => {
    expect(evaluateLessonMove(checkpoint, "a1a8").kind).toBe("illegal");
  });

  it("supports explicitly accepted alternatives", () => {
    const { legalMoves } = getLessonStepPosition(checkpoint);
    const alternative = legalMoves.find(move => move !== checkpoint.acceptedMoves![0]);
    expect(alternative).toBeTruthy();
    const withAlternative = { ...checkpoint, acceptedMoves: [...checkpoint.acceptedMoves!, alternative!] };
    expect(evaluateLessonMove(withAlternative, alternative!).kind).toBe("correct");
  });

  it("clamps resume progress to the playable lesson range", () => {
    expect(resumeLessonIndex(lesson, -4)).toBe(0);
    expect(resumeLessonIndex(lesson, 2)).toBe(2);
    expect(resumeLessonIndex(lesson, 999)).toBe(steps.length - 1);
  });
});