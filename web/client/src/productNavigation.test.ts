import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productRoutes";

describe("ChessIQ production product navigation", () => {
  it("routes Play, Analyze, Learn, Puzzles, and Progress through the real web product shell", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(app).toContain('<Route path="/" component={Play} />');
    expect(app).toContain('path="/play"');
    expect(app).toContain('path="/analyze"');
    expect(app).toContain('path="/learn"');
    expect(app).toContain('path="/puzzles"');
    expect(app).toContain('path="/progress"');
    expect(productRoutes.map(route => route.href)).toEqual(["/play", "/analyze", "/learn", "/puzzles", "/progress"]);
    expect(header).toContain("productRoutes.map");
    expect(header).toContain('href={href}');
  });

  it("uses the shared real-navigation header on every production surface", () => {
    const pages = ["Analyze", "Play", "Learn", "Puzzles", "Progress"];
    for (const page of pages) {
      const source = readFileSync(new URL(`./pages/${page}.tsx`, import.meta.url), "utf8");
      expect(source).toContain("ProductHeader");
      expect(source).not.toMatch(/coming next|next production surface|aria-disabled=\"true\">Play/);
    }
  });

  it("ships an interactive Learn workspace instead of a placeholder", () => {
    const learn = readFileSync(new URL("./pages/Learn.tsx", import.meta.url), "utf8");
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(learn).toContain("ChessIQ Learn");
    expect(learn).toContain("lessonProgress");
    expect(learn).toContain("aria-pressed");
    expect(learn).toContain('href="/analyze"');
    expect(entry).toContain('import "./product-surfaces.css"');
    expect(css).toContain(".learn-grid");
    expect(css).toContain("@media (max-width: 720px)");
  });

  it("ships an engine-backed interactive Puzzles workspace with persisted progress", () => {
    const puzzles = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(puzzles).toContain("ChessIQ Training");
    expect(puzzles).toContain("chessiq-puzzles-solved-v1");
    expect(puzzles).toContain("LegalChessBoard");
    expect(puzzles).toContain("fetchLegalMoves");
    expect(puzzles).toContain("playMove");
    expect(puzzles).not.toContain('aria-label="Candidate moves"');
    expect(puzzles).toContain('aria-live="polite"');
    expect(puzzles).toContain('href="/learn"');
    expect(css).toContain(".puzzles-layout");
    expect(css).toContain(".puzzle-feedback");
  });

  it("makes client-side product routes directly addressable on Vercel", () => {
    const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8");

    expect(vercel).toContain('"source": "/play"');
    expect(vercel).toContain('"source": "/analyze"');
    expect(vercel).toContain('"source": "/review"');
    expect(vercel).toContain('"source": "/learn"');
    expect(vercel).toContain('"source": "/puzzles"');
    expect(vercel).toContain('"source": "/progress"');
    expect(vercel).toContain('"destination": "/index.html"');
  });
});
