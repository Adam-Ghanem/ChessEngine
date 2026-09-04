import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ Play game room", () => {
  it("centers play around player bars, clocks, board, and a compact game panel", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(play).toContain("play-game-room");
    expect(play).toContain("play-player-bar");
    expect(play).toContain("play-clock");
    expect(play).toContain("game-panel");
    expect(play).toContain("Move list");
    expect(play).toContain("Review game");
    expect(play).not.toContain("play-hero");
    expect(css).toContain(".play-game-room");
    expect(css).toContain(".play-player-bar");
    expect(css).toContain(".play-clock");
    expect(css).toContain(".game-panel");
  });

  it("sends the saved game and current live position into Analyze", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

    expect(play).toContain('import { analysisHrefForGame } from "@/lib/analysisRoute"');
    expect(play).toContain('href={analysisHrefForGame(fen, gameId)}');
  });

  it("uses the approved cream, olive, navy, and warm-gold Play palette", () => {
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(css).toContain("--play-room-bg:#090d14");
    expect(css).toContain("--play-surface:#111722");
    expect(css).toContain("--play-gold:#d7a84f");
    expect(css).toContain("--play-board-light:#eee7d5");
    expect(css).toContain("--play-board-dark:#73805f");
    expect(css).toContain("background:var(--play-board-light)");
    expect(css).toContain("background:var(--play-board-dark)");
  });

  it("keeps the game room responsive with a full-width mobile board and panel below", () => {
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(css).toContain("@media(max-width:1030px)");
    expect(css).toContain("grid-template-columns:1fr");
    expect(css).toContain("@media(max-width:640px)");
    expect(css).toContain("width:100dvw");
  });
});
