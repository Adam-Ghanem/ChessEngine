import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ playable-board piece motion", () => {
  it("animates accepted moves from their source square to their destination", () => {
    const board = readFileSync(new URL("./components/LegalChessBoard.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(board).toContain("previousBoardRef");
    expect(board).toContain("play-moving-piece");
    expect(board).toContain("--play-move-x");
    expect(board).toContain("--play-move-y");
    expect(css).toContain("@keyframes chessiq-play-piece-move");
    expect(css).toContain("animation: chessiq-play-piece-move");
  });

  it("disables decorative piece travel when reduced motion is requested", () => {
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".play-moving-piece");
  });
});
