import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { scripts?: Record<string, string> };

describe("puzzle catalog engine verification", () => {
  it("validates the shared catalog with the compiled first-party ChessEngine during the Vercel build", () => {
    expect(pkg.scripts?.["verify:puzzles"]).toContain("verify-puzzle-catalog");
    expect(pkg.scripts?.["build:vercel"]).toContain("verify:puzzles");
  });
});
