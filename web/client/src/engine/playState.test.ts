import { describe, expect, it } from "vitest";
import { moveTargets, sideToMove, statusLabel } from "./playState";

describe("public Play state", () => {
  it("maps legal UCI moves to the selected square targets", () => {
    expect(moveTargets(["e2e4", "e2e3", "g1f3"], "e2")).toEqual(["e4", "e3"]);
  });

  it("reads the side to move from FEN", () => {
    expect(sideToMove("8/8/8/8/8/8/8/8 b - - 0 1")).toBe("black");
    expect(sideToMove("8/8/8/8/8/8/8/8 w - - 0 1")).toBe("white");
  });

  it("renders authoritative game status instead of guessing from legal move count", () => {
    expect(statusLabel("checkmate", "white")).toBe("Checkmate");
    expect(statusLabel("stalemate", "black")).toBe("Stalemate");
    expect(statusLabel("draw", "white")).toBe("Draw");
    expect(statusLabel("check", "white")).toBe("White to move · Check");
    expect(statusLabel("ongoing", "black")).toBe("Black to move");
  });
});
