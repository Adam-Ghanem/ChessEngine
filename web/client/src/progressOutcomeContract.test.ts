import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const progressSource = readFileSync(new URL("./pages/Progress.tsx", import.meta.url), "utf8");

describe("ChessIQ Progress outcome breakdown", () => {
  it("shows completed ChessIQ game results without inventing outcomes", () => {
    expect(progressSource).toContain('summarizeComputerGameOutcomes');
    expect(progressSource).toContain('aria-label="Results against ChessIQ"');
    expect(progressSource).toContain("Wins");
    expect(progressSource).toContain("Draws");
    expect(progressSource).toContain("Losses");
    expect(progressSource).toContain("completed games against ChessIQ");
  });
});
