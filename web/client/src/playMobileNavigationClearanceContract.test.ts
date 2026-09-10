import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dockCss = readFileSync(new URL("./mobile-training-docks.css", import.meta.url), "utf8");

describe("Play mobile action dock navigation clearance", () => {
  it("keeps Play actions above the fixed ChessIQ bottom navigation and safe area", () => {
    expect(dockCss).toContain("body .play-mobile-actions");
    expect(dockCss).toContain("bottom: calc(84px + env(safe-area-inset-bottom, 0px));");
  });
});
