import { describe, expect, it } from "vitest";
import { boardSquareAriaLabel } from "./boardAccessibility";

describe("boardSquareAriaLabel", () => {
  it("uses readable chess piece names", () => {
    expect(boardSquareAriaLabel({
      piece: { color: "white", kind: "N" },
      square: "f3",
      isSelected: false,
      isTarget: false,
    })).toBe("white knight on f3");
  });

  it("describes selected pieces", () => {
    expect(boardSquareAriaLabel({
      piece: { color: "black", kind: "Q" },
      square: "d8",
      isSelected: true,
      isTarget: false,
    })).toBe("black queen on d8, selected");
  });

  it("distinguishes legal moves from legal captures", () => {
    expect(boardSquareAriaLabel({
      square: "e4",
      isSelected: false,
      isTarget: true,
    })).toBe("Empty e4, legal move target");

    expect(boardSquareAriaLabel({
      piece: { color: "black", kind: "P" },
      square: "e5",
      isSelected: false,
      isTarget: true,
    })).toBe("black pawn on e5, legal capture target");
  });
});
