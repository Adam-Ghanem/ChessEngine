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

  it("exposes readable piece names and legal-target state to assistive technology", () => {
    expect(boardSource).toContain('from "@/lib/boardAccessibility"');
    expect(boardSource).toContain("boardSquareAriaLabel({");
    expect(boardSource).toContain("isSelected,");
    expect(boardSource).toContain("isTarget,");
  });

  it("wires the latest move origin and destination into square labels", () => {
    expect(boardSource).toContain("const lastMoveFrom = lastMove?.slice(0, 2) ?? null");
    expect(boardSource).toContain("const lastMoveTo = lastMove?.slice(2, 4) ?? null");
    expect(boardSource).toContain('lastMoveState: square === lastMoveFrom ? "from" : square === lastMoveTo ? "to" : undefined');
  });

  it("keeps a read-only board keyboard-inspectable while preventing moves", () => {
    expect(boardSource).toContain("aria-disabled={disabled || undefined}");
    expect(boardSource).not.toContain("disabled={disabled}");
    expect(boardSource).toContain("if (disabled) return;");
  });
});
