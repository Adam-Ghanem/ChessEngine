import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { productRoutes } from "./lib/productRoutes";

describe("ChessIQ production product navigation", () => {
  it("routes Home, Play, Games, Analyze, Learn, Puzzles, Progress, and Coach through the real web product shell", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(app).toContain('<Route path="/" component={Dashboard} />');
    expect(app).toContain('path="/play"');
    expect(app).toContain('path="/games"');
    expect(app).toContain('path="/analyze"');
    expect(app).toContain('path="/learn"');
    expect(app).toContain('path="/puzzles"');
    expect(app).toContain('path="/progress"');
    expect(app).toContain('path="/coach"');
    expect(productRoutes.map(route => route.href)).toEqual(["/", "/play", "/puzzles", "/learn", "/games", "/analyze", "/coach", "/progress"]);
    expect(header).toContain("productRoutes.map");
    expect(header).toContain('href={href}');
  });

  it("keeps the active product visible inside the horizontally scrollable mobile navigation", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");

    expect(header).toContain("activeLinkRef");
    expect(header).toContain("scrollIntoView");
    expect(header).toContain('inline: "center"');
    expect(header).toContain('block: "nearest"');
  });

  it("lets keyboard users skip the shared navigation to the product workspace", () => {
    const header = readFileSync(new URL("./components/ProductHeader.tsx", import.meta.url), "utf8");
    const entry = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./accessibility.css", import.meta.url), "utf8");

    expect(header).toContain('href="#main-content"');
    expect(header).toContain('className="skip-link"');
    expect(header).toContain('id="main-content"');
    expect(header).toContain('tabIndex={-1}');
    expect(entry).toContain('import "./accessibility.css"');
    expect(css).toContain(".skip-link");
    expect(css).toContain(".skip-link:focus-visible");
  });

  it("uses the shared real-navigation header on every production surface", () => {
    const pages = ["Dashboard", "Analyze", "Play", "Games", "Learn", "Puzzles", "Progress", "Coach"];
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
    const catalog = readFileSync(new URL("./lib/puzzleCatalog.ts", import.meta.url), "utf8");
    const css = readFileSync(new URL("./product-surfaces.css", import.meta.url), "utf8");

    expect(puzzles).toContain("ChessIQ Training");
    expect(catalog).toContain("chessiq-puzzles-solved-v1");
    expect(puzzles).toContain("LegalChessBoard");
    expect(puzzles).toContain("fetchLegalMoves");
    expect(puzzles).toContain("playMove");
    expect(puzzles).not.toContain('aria-label="Candidate moves"');
    expect(puzzles).toContain('aria-live="polite"');
    expect(puzzles).toContain('href="/learn"');
    expect(css).toContain(".puzzles-layout");
    expect(css).toContain(".puzzle-feedback");
  });

  it("ships an evidence-based Coach workspace without fabricated metrics", () => {
    const coach = readFileSync(new URL("./pages/Coach.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("./coach.css", import.meta.url), "utf8");

    expect(coach).toContain("ChessIQ Coach");
    expect(coach).toContain("readGameHistory");
    expect(coach).toContain("chessiq.learn.progress");
    expect(coach).toContain("chessiq-puzzles-solved-v1");
    expect(coach).toContain('aria-label="Recommended training plan"');
    expect(coach).not.toMatch(/rating|win rate|accuracy/i);
    expect(css).toContain(".coach-grid");
    expect(css).toContain("@media (max-width: 720px)");
  });

  it("makes client-side product routes directly addressable on Vercel", () => {
    const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8");

    expect(vercel).toContain('"source": "/play"');
    expect(vercel).toContain('"source": "/games"');
    expect(vercel).toContain('"source": "/analyze"');
    expect(vercel).toContain('"source": "/review"');
    expect(vercel).toContain('"source": "/learn"');
    expect(vercel).toContain('"source": "/puzzles"');
    expect(vercel).toContain('"source": "/progress"');
    expect(vercel).toContain('"source": "/coach"');
    expect(vercel).toContain('"destination": "/index.html"');
  });
});
