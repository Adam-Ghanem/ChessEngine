import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ Home and Play premium polish", () => {
  it("gives Home a clear primary and secondary action hierarchy", () => {
    const dashboard = readFileSync(new URL("./pages/Dashboard.tsx", import.meta.url), "utf8");

    expect(dashboard).toContain("premium-hero-actions");
    expect(dashboard).toContain('href="/play"');
    expect(dashboard).toContain('href="/analyze"');
    expect(dashboard).toContain("premium-hero-proof");
  });

  it("adds a compact game context header to Play without changing engine behavior", () => {
    const play = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

    expect(play).toContain("play-room-header");
    expect(play).toContain("timeControl.label");
    expect(play).toContain("First-party ChessEngine");
  });

  it("ships a dedicated responsive polish layer from the production web entrypoint", () => {
    const main = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const cssUrl = new URL("./home-play-polish.css", import.meta.url);

    expect(main).toContain('import "./home-play-polish.css"');
    expect(existsSync(cssUrl)).toBe(true);
    const css = readFileSync(cssUrl, "utf8");
    expect(css).toContain("@media (max-width: 640px)");
    expect(css).toContain("prefers-reduced-motion");
  });
});
