import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Vercel analysis function runtime", () => {
  it("keeps protocol parsing self-contained in the serverless entrypoint", () => {
    const source = readFileSync(new URL("../api/analyze.ts", import.meta.url), "utf8");
    expect(source).not.toContain('from "../shared/engineProtocol"');
    expect(source).toContain("function normalizeDepth");
    expect(source).toContain("function parseUciInfo");
  });

  it("resolves the packaged ChessEngine beside the deployed function, not from process.cwd", () => {
    const source = readFileSync(new URL("../api/analyze.ts", import.meta.url), "utf8");
    expect(source).toContain("fileURLToPath(import.meta.url)");
    expect(source).toContain('path.join(__dirname, "bin", "ChessEngine")');
    expect(source).not.toContain('path.join(process.cwd(), "api", "bin", "ChessEngine")');
  });
});
