import { describe, expect, it } from "vitest";
import { nextBoardFocusSquare } from "@/lib/boardKeyboardNavigation";

describe("ChessIQ keyboard chessboard navigation", () => {
  it("moves one visual square with the arrow keys for White orientation", () => {
    expect(nextBoardFocusSquare("e4", "ArrowLeft", "white")).toBe("d4");
    expect(nextBoardFocusSquare("e4", "ArrowRight", "white")).toBe("f4");
    expect(nextBoardFocusSquare("e4", "ArrowUp", "white")).toBe("e5");
    expect(nextBoardFocusSquare("e4", "ArrowDown", "white")).toBe("e3");
  });

  it("follows the board's visual direction when Black is at the bottom", () => {
    expect(nextBoardFocusSquare("e4", "ArrowLeft", "black")).toBe("f4");
    expect(nextBoardFocusSquare("e4", "ArrowRight", "black")).toBe("d4");
    expect(nextBoardFocusSquare("e4", "ArrowUp", "black")).toBe("e3");
    expect(nextBoardFocusSquare("e4", "ArrowDown", "black")).toBe("e5");
  });

  it("keeps focus inside the board and supports Home and End", () => {
    expect(nextBoardFocusSquare("a8", "ArrowUp", "white")).toBe("a8");
    expect(nextBoardFocusSquare("h1", "ArrowDown", "white")).toBe("h1");
    expect(nextBoardFocusSquare("e4", "Home", "white")).toBe("a4");
    expect(nextBoardFocusSquare("e4", "End", "white")).toBe("h4");
    expect(nextBoardFocusSquare("e4", "Home", "black")).toBe("h4");
    expect(nextBoardFocusSquare("e4", "End", "black")).toBe("a4");
  });

  it("ignores unrelated keys", () => {
    expect(nextBoardFocusSquare("e4", "Enter", "white")).toBeNull();
  });
});
