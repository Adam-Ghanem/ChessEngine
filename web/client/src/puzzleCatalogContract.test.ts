import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const puzzlesSource = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");
const progressSource = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

describe("ChessIQ expanded puzzle training contract", () => {
  it("uses one shared puzzle catalog across training and progress", () => {
    expect(puzzlesSource).toContain('from "@/lib/puzzleCatalog"');
    expect(progressSource).toContain('from "@/lib/puzzleCatalog"');
    expect(progressSource).toContain("PUZZLE_TOTAL");
    expect(progressSource).not.toContain("const TOTAL_PUZZLES = 3");
  });

  it("keeps the production web entrypoint unchanged", () => {
    expect(mainSource).toContain('import App from "./App"');
  });
});
