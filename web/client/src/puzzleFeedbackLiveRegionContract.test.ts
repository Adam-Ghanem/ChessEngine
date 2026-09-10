import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const puzzlesSource = readFileSync(new URL("./pages/Puzzles.tsx", import.meta.url), "utf8");

describe("ChessIQ puzzle feedback announcements", () => {
  it("announces multi-part puzzle feedback atomically", () => {
    expect(puzzlesSource).toContain('role="status" aria-live="polite" aria-atomic="true"');
  });
});
