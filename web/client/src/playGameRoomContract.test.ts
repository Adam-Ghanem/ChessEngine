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
    expect(play).toContain("Open Analyze");
    expect(play).not.toContain("play-hero");
    expect(css).toContain(".play-game-room");
    expect(css).toContain(".play-player-bar");
    expect(css).toContain(".play-clock");
    expect(css).toContain(".game-panel");
  });

  it("keeps the game room responsive with a full-width mobile board and panel below", () => {
    const css = readFileSync(new URL("./play.css", import.meta.url), "utf8");

    expect(css).toContain("@media(max-width:1030px)");
    expect(css).toContain("grid-template-columns:1fr");
    expect(css).toContain("@media(max-width:640px)");
    expect(css).toContain("width:100dvw");
  });
});
