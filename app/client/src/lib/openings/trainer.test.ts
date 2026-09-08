import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { evaluateTrainerMove, sortTrainerSessionQueue, trainerOrientation } from "./trainer";

function positionAfter(moves: string[]) {
  const chess = new Chess();
  for (const uci of moves) chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as "q" | "r" | "b" | "n" | undefined });
  return chess.fen();
}

const whiteQuestion = {
  fen: new Chess().fen(),
  canonicalMove: "e2e4",
  acceptableMoves: ["e2e4", "d2d4"],
};

const blackQuestion = {
  fen: positionAfter(["e2e4"]),
  canonicalMove: "c7c5",
  acceptableMoves: ["c7c5", "e7e5"],
};

describe("evaluateTrainerMove", () => {
  it("marks the canonical move correct", () => {
    expect(evaluateTrainerMove(whiteQuestion, "e2e4")).toEqual({ kind: "correct", canonicalMove: "e2e4" });
  });

  it("accepts a legal canonical alternative without calling it the main move", () => {
    expect(evaluateTrainerMove(whiteQuestion, "d2d4")).toEqual({ kind: "acceptable", canonicalMove: "e2e4" });
  });

  it("marks a legal non-repertoire move wrong", () => {
    expect(evaluateTrainerMove(whiteQuestion, "g1f3")).toEqual({ kind: "wrong", canonicalMove: "e2e4" });
  });

  it("rejects an illegal move before repertoire comparison", () => {
    expect(evaluateTrainerMove(whiteQuestion, "e2e5")).toEqual({ kind: "illegal", canonicalMove: "e2e4" });
  });

  it("evaluates black-to-move positions with chess legality", () => {
    expect(evaluateTrainerMove(blackQuestion, "c7c5").kind).toBe("correct");
    expect(evaluateTrainerMove(blackQuestion, "g1f3").kind).toBe("illegal");
  });
});

describe("trainer session ordering", () => {
  it("keeps overdue and weak items ahead with stable tie-breaking", () => {
    const queue = sortTrainerSessionQueue([
      { id: "solid", overdueDays: 0, masteryScore: 82, lapses: 0 },
      { id: "weak-b", overdueDays: 4, masteryScore: 34, lapses: 2 },
      { id: "weak-a", overdueDays: 4, masteryScore: 34, lapses: 2 },
      { id: "due", overdueDays: 7, masteryScore: 60, lapses: 0 },
    ]);
    expect(queue.map(item => item.id)).toEqual(["due", "weak-a", "weak-b", "solid"]);
  });

  it("maps repertoire side to board orientation", () => {
    expect(trainerOrientation("white")).toBe("white");
    expect(trainerOrientation("black")).toBe("black");
  });
});
