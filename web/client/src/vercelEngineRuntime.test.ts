import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Vercel ChessEngine function runtime", () => {
  it("keeps runtime-only helpers inside the function bundle", () => {
    const source = readFileSync(new URL("../../api/analyze.ts", import.meta.url), "utf8");
    expect(source).not.toContain('../shared/engineProtocol');
    expect(source).toContain("function normalizeDepth");
    expect(source).toContain("function parseUciInfo");
  });
});
