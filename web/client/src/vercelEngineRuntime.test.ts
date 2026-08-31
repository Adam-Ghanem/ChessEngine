import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Vercel ChessEngine function runtime", () => {
  it("keeps runtime-only helpers inside the function bundle", () => {
    const source = readFileSync(new URL("../../api/analyze.ts", import.meta.url), "utf8");
    expect(source).not.toContain('../shared/engineProtocol');
    expect(source).toContain("function normalizeDepth");
    expect(source).toContain("function parseUciInfo");
  });

  it("resolves the packaged binary beside the deployed function", () => {
    const source = readFileSync(new URL("../../api/analyze.ts", import.meta.url), "utf8");
    expect(source).toContain("fileURLToPath(import.meta.url)");
    expect(source).toContain('path.join(__dirname, "bin", "ChessEngine")');
    expect(source).not.toContain('path.join(process.cwd(), "api", "bin", "ChessEngine")');
  });
});
