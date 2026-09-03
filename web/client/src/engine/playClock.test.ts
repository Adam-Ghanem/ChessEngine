import { describe, expect, it } from "vitest";
import { elapsedClockSeconds } from "./playClock";

describe("elapsedClockSeconds", () => {
  it("counts only complete elapsed seconds", () => {
    expect(elapsedClockSeconds(1_000, 1_999)).toBe(0);
    expect(elapsedClockSeconds(1_000, 2_000)).toBe(1);
    expect(elapsedClockSeconds(1_000, 6_250)).toBe(5);
  });

  it("recovers long background gaps without overcounting", () => {
    expect(elapsedClockSeconds(10_000, 70_400)).toBe(60);
  });

  it("never reports negative elapsed time", () => {
    expect(elapsedClockSeconds(5_000, 4_000)).toBe(0);
    expect(elapsedClockSeconds(Number.NaN, 5_000)).toBe(0);
  });
});
