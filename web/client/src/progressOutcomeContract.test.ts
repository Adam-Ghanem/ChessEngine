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

  it("shows a labeled recent form from verified saved computer results", () => {
    expect(progressSource).toContain("summarizeRecentComputerForm");
    expect(progressSource).toContain('aria-label="Recent form against ChessIQ"');
    expect(progressSource).toContain("Last 5 completed games");
    expect(progressSource).toContain('aria-label={`Recent game ${index + 1}: ${result}`}');
  });
});
