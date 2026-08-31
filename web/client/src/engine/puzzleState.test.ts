import { describe, expect, it } from "vitest";
import { evaluatePuzzleMove } from "./puzzleState";

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
});
