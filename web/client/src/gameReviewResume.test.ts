import { describe, expect, it } from "vitest";
import * as gameReview from "@/lib/gameReview";

type ResumeReviewPly = (totalMoves: number, reviewedPlies: readonly number[], currentReplayIndex: number) => number;

const resumeReviewPly = (gameReview as unknown as { resumeReviewPly?: ResumeReviewPly }).resumeReviewPly;

describe("saved-game review resume position", () => {
  it("jumps a partial review to the first unreviewed move", () => {
    expect(resumeReviewPly).toBeTypeOf("function");
    if (!resumeReviewPly) return;

    expect(resumeReviewPly(6, [1, 2, 4], 6)).toBe(3);
  });

  it("keeps the current replay position when nothing has been reviewed yet or the review is complete", () => {
    expect(resumeReviewPly).toBeTypeOf("function");
    if (!resumeReviewPly) return;

    expect(resumeReviewPly(6, [], 6)).toBe(6);
    expect(resumeReviewPly(6, [1, 2, 3, 4, 5, 6], 4)).toBe(4);
  });

  it("ignores invalid cached ply numbers", () => {
    expect(resumeReviewPly).toBeTypeOf("function");
    if (!resumeReviewPly) return;

    expect(resumeReviewPly(4, [0, -1, 1, 9, Number.NaN], 4)).toBe(2);
  });
});
