import { describe, expect, it } from "vitest";
import { PLAY_DIFFICULTIES, getPlayDifficulty } from "./playDifficulty";

describe("Play engine difficulty", () => {
  it("offers three ordered first-party ChessEngine levels", () => {
    expect(PLAY_DIFFICULTIES.map(level => level.id)).toEqual(["easy", "medium", "hard"]);
    expect(PLAY_DIFFICULTIES.map(level => level.depth)).toEqual([3, 5, 7]);
  });

  it("falls back to medium for unknown persisted values", () => {
    expect(getPlayDifficulty("hard").id).toBe("hard");
    expect(getPlayDifficulty("unknown").id).toBe("medium");
    expect(getPlayDifficulty(null).id).toBe("medium");
  });
});
