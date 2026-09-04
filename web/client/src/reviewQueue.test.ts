import { describe, expect, it } from "vitest";
import { pendingReviewPlies } from "@/lib/gameReview";

describe("full game review queue", () => {
  it("returns only unreviewed plies in game order", () => {
    expect(pendingReviewPlies(6, [2, 5])).toEqual([1, 3, 4, 6]);
  });

  it("ignores invalid cached plies and returns an empty queue when complete", () => {
    expect(pendingReviewPlies(3, [0, 1, 2, 3, 9])).toEqual([]);
    expect(pendingReviewPlies(0, [])).toEqual([]);
  });
});
