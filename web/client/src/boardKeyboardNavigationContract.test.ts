import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const boardSource = readFileSync(new URL("./components/LegalChessBoard.tsx", import.meta.url), "utf8");

describe("ChessIQ chessboard keyboard accessibility contract", () => {
  it("keeps one square in the tab order and moves focus with board navigation keys", () => {
    expect(boardSource).toContain('from "@/lib/boardKeyboardNavigation"');
    expect(boardSource).toContain("const [focusedSquare, setFocusedSquare]");
    expect(boardSource).toContain("tabIndex={square === focusedSquare ? 0 : -1}");
    expect(boardSource).toContain("onKeyDown={event => handleSquareKeyDown(event, square)}");
    expect(boardSource).toContain("data-square={square}");
  });
});
