import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const board = readFileSync(new URL("./components/ChessBoard.tsx", import.meta.url), "utf8");

describe("presentation chessboard integrity", () => {
  it("does not expose fabricated legal-move interactions", () => {
    expect(board).not.toContain("const legalTargets");
    expect(board).not.toContain("selectSquare");
    expect(board).not.toContain("is-target");
    expect(board).not.toContain("Select a piece to inspect legal destinations");
  });

  it("keeps analysis squares out of the tab order", () => {
    expect(board).toContain('role="gridcell"');
    expect(board).not.toContain("<button key={square}");
  });
});
