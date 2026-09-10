import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const playCss = readFileSync(new URL("./play.css", import.meta.url), "utf8");

describe("Play mobile action dock navigation clearance", () => {
  it("keeps Play actions above the fixed ChessIQ bottom navigation and safe area", () => {
    expect(playCss).toContain(
      ".play-mobile-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem;position:sticky;bottom:calc(84px + env(safe-area-inset-bottom, 0px))",
    );
  });
});
