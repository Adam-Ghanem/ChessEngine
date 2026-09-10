import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ legal board selection semantics", () => {
  it("exposes square selection with gridcell semantics", () => {
    const board = readFileSync(new URL("./components/LegalChessBoard.tsx", import.meta.url), "utf8");

    expect(board).toContain('role="gridcell"');
    expect(board).toContain("aria-selected={isSelected}");
    expect(board).not.toContain("aria-pressed={isSelected}");
  });
});
