import { describe, expect, it } from "vitest";
import { clockSnapshotAfterUndo, elapsedClockSeconds } from "./playClock";

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

describe("clockSnapshotAfterUndo", () => {
  const history = [
    { whiteSeconds: 300, blackSeconds: 300 },
    { whiteSeconds: 292, blackSeconds: 300 },
    { whiteSeconds: 292, blackSeconds: 294 },
    { whiteSeconds: 286, blackSeconds: 294 },
  ];

  it("restores the clock snapshot that belongs to the target position", () => {
    expect(clockSnapshotAfterUndo(history, 2)).toEqual({
      whiteSeconds: 292,
      blackSeconds: 300,
    });
  });

  it("rejects unsafe undo requests instead of inventing clock state", () => {
    expect(clockSnapshotAfterUndo(history, 0)).toBeNull();
    expect(clockSnapshotAfterUndo(history, history.length)).toBeNull();
    expect(clockSnapshotAfterUndo([], 1)).toBeNull();
  });
});