import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Analyze board keyboard accessibility", () => {
  it("provides roving focus, arrow-key navigation, and a visible focus indicator", () => {
    const board = readFileSync(new URL("./components/ChessBoard.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./index.css", import.meta.url), "utf8");

    expect(board).toContain('nextBoardFocusSquare');
    expect(board).toContain('const [focusedSquare, setFocusedSquare]');
    expect(board).toContain('tabIndex={square === focusedSquare ? 0 : -1}');
    expect(board).toContain('onFocus={() => setFocusedSquare(square)}');
    expect(board).toContain('onKeyDown={event => handleSquareKeyDown(event, square)}');
    expect(styles).toContain('.board-square:focus-visible');
  });
});
