import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const playSource = readFileSync(new URL("./pages/Play.tsx", import.meta.url), "utf8");

describe("Play clock accessibility contract", () => {
  it("exposes each chess clock as a semantic timer with the remaining time in its accessible name", () => {
    expect(playSource).toContain('role="timer"');
    expect(playSource).toContain("clockAccessibleLabel(name, seconds)");
  });
});
