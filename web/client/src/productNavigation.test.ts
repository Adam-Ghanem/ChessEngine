import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("ChessIQ production product navigation", () => {
  it("routes Analyze and Learn through the real web product shell", () => {
    const app = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");

    expect(app).toContain('path="/analyze"');
    expect(app).toContain('path="/learn"');
    expect(home).toContain('href="/learn"');
    expect(home).not.toContain("Learning workspace is coming next.");
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
});
