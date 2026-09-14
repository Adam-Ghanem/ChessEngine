import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ Games action touch targets", () => {
  it("keeps toolbar and saved-game buttons at least 44px tall across layouts", () => {
    const css = readFileSync(new URL("./games.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.games-toolbar button,\.game-history-actions button\{[^}]*min-height:44px/);
  });

  it("keeps saved-game and history actions at least 44px tall on phones", () => {
    const css = readFileSync(new URL("./games.css", import.meta.url), "utf8");

    expect(css).toContain("@media(max-width:700px)");
    expect(css).toContain(".games-toolbar button{min-height:44px}");
    expect(css).toContain(".game-history-actions button,.game-history-actions .primary-action{min-height:44px}");
  });
});
