import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ production product navigation", () => {
  it("routes Analyze, Learn, and Puzzles through the real web product shell", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
    const learn = readFileSync(new URL("./pages/Learn.tsx", import.meta.url), "utf8");

    expect(app).toContain('path="/analyze"');
    expect(app).toContain('path="/learn"');
    expect(app).toContain('path="/puzzles"');
    expect(home).toContain('href="/learn"');
    expect(home).toContain('href="/puzzles"');
    expect(home).not.toContain("Learning workspace is coming next.");
    expect(home).not.toContain("Puzzle training is coming next.");
    expect(learn).toContain('href="/puzzles"');
    expect(learn).not.toContain("Puzzle training is the next production surface.");
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

  it("ships a real Puzzles workspace with persisted progress and accessible choices", () => {
    const puzzles = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(puzzles).toContain("ChessIQ Training");
    expect(puzzles).toContain("chessiq-puzzles-solved-v1");
    expect(puzzles).toContain('role="group" aria-label="Candidate moves"');
    expect(puzzles).toContain('aria-live="polite"');
    expect(puzzles).toContain('href="/learn"');
    expect(css).toContain(".puzzles-layout");
    expect(css).toContain(".puzzle-choices");
  });

  it("makes client-side product routes directly addressable on Vercel", () => {
    const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8");

    expect(vercel).toContain('"source": "/analyze"');
    expect(vercel).toContain('"source": "/learn"');
    expect(vercel).toContain('"source": "/puzzles"');
    expect(vercel).toContain('"destination": "/index.html"');
  });
});
