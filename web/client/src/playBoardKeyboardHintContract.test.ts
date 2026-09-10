import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Play board keyboard guidance", () => {
  it("describes the playable board's keyboard controls to assistive technology", () => {
    const board = readFileSync(new URL("./components/LegalChessBoard.tsx", import.meta.url), "utf8");

    expect(board).toContain('aria-describedby={keyboardHintId}');
    expect(board).toContain('id={keyboardHintId}');
    expect(board).toContain('className="sr-only"');
    expect(board).toContain('Use arrow keys to move between squares. Press Enter or Space to select a piece and its destination.');
  });
});
