import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("ChessIQ keyboard and motion contracts", () => {
  it("keeps every functional product surface reachable through native navigation controls", () => {
    const header = read("client/src/components/ProductHeader.tsx");
    const board = read("client/src/components/PlayableChessBoard.tsx");
    const routes = read("client/src/App.tsx");

    expect(header).toContain("<Link");
    expect(header).toContain("<button");
    expect(board).toContain('role="gridcell"');
    expect(board).toContain('type="button"');
    ["/play", "/analyze", "/learn", "/puzzles", "/games", "/progress", "/coach"].forEach(route => expect(routes).toContain(`path="${route}"`));
  });

  it("declares visible focus and reduced-motion treatment for product controls", () => {
    const css = read("client/src/index.css");
    expect(css).toContain("prefers-reduced-motion:reduce");
    expect(css).toContain(".product-page :is(a,button,textarea):focus-visible");
    expect(css).toContain(".play-square:focus-visible");
    expect(css).toContain("promotion-picker");
  });
});
