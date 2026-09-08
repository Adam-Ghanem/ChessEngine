import { describe, expect, it } from "vitest";
import { calculateOpeningMastery, scheduleOpeningReview, sortOpeningReviewQueue } from "./srs";

const NOW = new Date("2026-09-08T00:00:00.000Z");

describe("opening spaced repetition", () => {
  it("schedules Again sooner than Hard, Good, and Easy", () => {
    const again = scheduleOpeningReview(undefined, "again", NOW);
    const hard = scheduleOpeningReview(undefined, "hard", NOW);
    const good = scheduleOpeningReview(undefined, "good", NOW);
    const easy = scheduleOpeningReview(undefined, "easy", NOW);

    expect(again.dueAt.getTime()).toBeLessThan(hard.dueAt.getTime());
    expect(hard.dueAt.getTime()).toBeLessThan(good.dueAt.getTime());
    expect(good.dueAt.getTime()).toBeLessThan(easy.dueAt.getTime());
    expect(again.lapses).toBe(1);
  });

  it("is deterministic for the same state, rating, and timestamp", () => {
    const state = { ease: 250, intervalDays: 6, streak: 3, lapses: 1 };
    expect(scheduleOpeningReview(state, "good", NOW)).toEqual(scheduleOpeningReview(state, "good", NOW));
  });

  it("clamps ease instead of letting reviews become pathological", () => {
    const state = { ease: 130, intervalDays: 3, streak: 0, lapses: 8 };
    const result = Array.from({ length: 20 }).reduce(
      current => scheduleOpeningReview(current, "hard", NOW),
      scheduleOpeningReview(state, "hard", NOW),
    );
    expect(result.ease).toBeGreaterThanOrEqual(130);
    expect(result.ease).toBeLessThanOrEqual(300);
  });

  it("marks overdue low-accuracy evidence as weak", () => {
    const mastery = calculateOpeningMastery([
      { accuracy: 0.38, retention: 0.35, overdueDays: 9, intervalDays: 1, criticalWeight: 1.5, reviewed: true },
      { accuracy: 0.5, retention: 0.45, overdueDays: 3, intervalDays: 2, criticalWeight: 1, reviewed: true },
    ]);
    expect(mastery.state).toBe("weak");
    expect(mastery.score).toBeLessThan(50);
  });

  it("requires sustained review evidence before calling an opening mastered", () => {
    expect(calculateOpeningMastery([]).state).toBe("new");
    const mastery = calculateOpeningMastery([
      { accuracy: 0.96, retention: 0.95, overdueDays: 0, intervalDays: 30, criticalWeight: 1.5, reviewed: true },
      { accuracy: 0.92, retention: 0.93, overdueDays: 0, intervalDays: 21, criticalWeight: 1, reviewed: true },
      { accuracy: 0.94, retention: 0.91, overdueDays: 0, intervalDays: 14, criticalWeight: 1, reviewed: true },
    ]);
    expect(mastery.state).toBe("mastered");
    expect(mastery.score).toBeGreaterThanOrEqual(85);
  });

  it("prioritizes overdue lapses before normal due and new material", () => {
    const queue = sortOpeningReviewQueue([
      { id: "new", dueAt: null, lapses: 0, criticalWeight: 1, isNew: true },
      { id: "normal", dueAt: new Date("2026-09-07T20:00:00Z"), lapses: 0, criticalWeight: 1, isNew: false },
      { id: "critical", dueAt: new Date("2026-09-07T23:00:00Z"), lapses: 0, criticalWeight: 2, isNew: false },
      { id: "lapse", dueAt: new Date("2026-09-05T00:00:00Z"), lapses: 3, criticalWeight: 1, isNew: false },
    ], NOW);
    expect(queue.map(item => item.id)).toEqual(["lapse", "critical", "normal", "new"]);
  });
});
