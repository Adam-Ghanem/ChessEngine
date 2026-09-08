import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("opening lesson board annotations", () => {
  const board = readFileSync(new URL("./components/openings/OpeningBoardWorkspace.tsx", import.meta.url), "utf8");

  it("accepts shared lesson annotations without changing the interactive move API", () => {
    expect(board).toContain("annotations?: BoardAnnotation[]");
    expect(board).toContain("onMove?: (uci: string) => void");
    expect(board).toContain("onMove(`${candidate.from}${candidate.to}${candidate.promotion ?? \"\"}`)");
  });

  it("renders arrows in a pointer-transparent SVG overlay", () => {
    expect(board).toContain('className="opening-board-annotations"');
    expect(board).toContain("<svg");
    expect(board).toContain("pointer-events");
    expect(board).toContain("markerEnd");
  });

  it("maps square concepts to non-interactive visual states", () => {
    expect(board).toContain("annotationSquares");
    expect(board).toContain("is-lesson-highlight");
    expect(board).toContain("is-lesson-zone");
    expect(board).toContain("is-pawn-structure");
  });

  it("surfaces annotation labels to assistive technology", () => {
    expect(board).toContain("opening-annotation-legend");
    expect(board).toContain("annotation.label");
    expect(board).toContain('aria-label="Lesson board annotations"');
  });
});
