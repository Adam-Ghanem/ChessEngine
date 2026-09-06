import { describe, expect, it } from "vitest";
import { requiresNewGameConfirmation } from "./playReset";

describe("requiresNewGameConfirmation", () => {
  it("protects an active game once at least one move exists", () => {
    expect(requiresNewGameConfirmation(1, false)).toBe(true);
    expect(requiresNewGameConfirmation(18, false)).toBe(true);
  });

  it("does not interrupt an empty or already-finished game", () => {
    expect(requiresNewGameConfirmation(0, false)).toBe(false);
    expect(requiresNewGameConfirmation(20, true)).toBe(false);
  });
});
