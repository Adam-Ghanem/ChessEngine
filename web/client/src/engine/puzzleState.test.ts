import { describe, expect, it } from "vitest";
import { evaluatePuzzleMove, nextPuzzleAutoReply } from "./puzzleState";

describe("interactive puzzle line validation", () => {
  it("rejects a legal move that is not the expected solution move", () => {
    expect(evaluatePuzzleMove(["d1d8"], 0, "h2h3")).toEqual({ accepted: false, solved: false, nextIndex: 0 });
  });

  it("marks the final expected move solved", () => {
    expect(evaluatePuzzleMove(["d1d8"], 0, "d1d8")).toEqual({ accepted: true, solved: true, nextIndex: 1 });
  });

  it("advances through multi-move solution lines without fabricating completion", () => {
    expect(evaluatePuzzleMove(["e4f6", "e8f8"], 0, "e4f6")).toEqual({ accepted: true, solved: false, nextIndex: 1 });
  });

  it("returns the forced opponent reply and advances control back to the solver", () => {
    expect(nextPuzzleAutoReply(["h5h7", "g8h7", "g5g7"], 1)).toEqual({
      move: "g8h7",
      nextIndex: 2,
      solved: false,
    });
  });

  it("does not invent an opponent reply after the solution is complete", () => {
    expect(nextPuzzleAutoReply(["d1d8"], 1)).toEqual({ move: null, nextIndex: 1, solved: true });
  });
});
