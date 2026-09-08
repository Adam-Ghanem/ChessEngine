export type ReviewRating = "again" | "hard" | "good" | "easy";
export type MasteryState = "new" | "learning" | "weak" | "solid" | "mastered";

export type OpeningReviewState = {
  ease: number;
  intervalDays: number;
  streak: number;
  lapses: number;
};

export type ScheduledOpeningReview = OpeningReviewState & {
  dueAt: Date;
  lastResult: ReviewRating;
  lastReviewedAt: Date;
};

export type MasteryEvidence = {
  accuracy: number;
  retention: number;
  overdueDays: number;
  intervalDays: number;
  criticalWeight: number;
  reviewed: boolean;
};

export type OpeningMastery = {
  score: number;
  state: MasteryState;
};

export type OpeningQueueItem = {
  id: string;
  dueAt: Date | null;
  lapses: number;
  criticalWeight: number;
  isNew: boolean;
};

const MIN_EASE = 130;
const MAX_EASE = 300;
const DAY_MS = 86_400_000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + Math.max(1, Math.round(days)) * DAY_MS);
}

export function scheduleOpeningReview(
  current: Partial<OpeningReviewState> | undefined,
  rating: ReviewRating,
  reviewedAt: Date,
): ScheduledOpeningReview {
  const ease = clamp(current?.ease ?? 250, MIN_EASE, MAX_EASE);
  const interval = Math.max(0, current?.intervalDays ?? 0);
  const streak = Math.max(0, current?.streak ?? 0);
  const lapses = Math.max(0, current?.lapses ?? 0);

  let nextEase = ease;
  let nextInterval = interval;
  let nextStreak = streak;
  let nextLapses = lapses;

  switch (rating) {
    case "again":
      nextEase = clamp(ease - 20, MIN_EASE, MAX_EASE);
      nextInterval = 1;
      nextStreak = 0;
      nextLapses = lapses + 1;
      break;
    case "hard":
      nextEase = clamp(ease - 10, MIN_EASE, MAX_EASE);
      nextInterval = interval === 0 ? 2 : Math.max(2, Math.round(interval * 1.2));
      nextStreak = streak + 1;
      break;
    case "good":
      nextInterval = interval === 0 ? 4 : Math.max(interval + 1, Math.round(interval * (ease / 100)));
      nextStreak = streak + 1;
      break;
    case "easy":
      nextEase = clamp(ease + 15, MIN_EASE, MAX_EASE);
      nextInterval = interval === 0 ? 7 : Math.max(interval + 2, Math.round(interval * ((ease + 30) / 100)));
      nextStreak = streak + 1;
      break;
  }

  return {
    ease: nextEase,
    intervalDays: nextInterval,
    streak: nextStreak,
    lapses: nextLapses,
    dueAt: addDays(reviewedAt, nextInterval),
    lastResult: rating,
    lastReviewedAt: new Date(reviewedAt),
  };
}

export function calculateOpeningMastery(evidence: readonly MasteryEvidence[]): OpeningMastery {
  const reviewed = evidence.filter(item => item.reviewed);
  if (reviewed.length === 0) return { score: 0, state: "new" };

  let weightedScore = 0;
  let totalWeight = 0;
  for (const item of reviewed) {
    const weight = clamp(item.criticalWeight || 1, 0.5, 3);
    const accuracy = clamp(item.accuracy, 0, 1);
    const retention = clamp(item.retention, 0, 1);
    const maturity = clamp(item.intervalDays / 30, 0, 1);
    const overduePenalty = clamp(item.overdueDays / 14, 0, 1) * 0.25;
    const quality = clamp(
      accuracy * 0.4 + retention * 0.35 + maturity * 0.15 + 0.1 - overduePenalty,
      0,
      1,
    );
    weightedScore += quality * weight;
    totalWeight += weight;
  }

  const score = Math.round((weightedScore / Math.max(totalWeight, 1)) * 100);
  if (score < 45) return { score, state: "weak" };
  if (score < 65) return { score, state: "learning" };
  if (score < 85) return { score, state: "solid" };
  return { score, state: "mastered" };
}

function queueTier(item: OpeningQueueItem, now: Date) {
  if (item.isNew || !item.dueAt) return 4;
  const due = item.dueAt.getTime() <= now.getTime();
  if (due && item.lapses > 0) return 0;
  if (due && item.criticalWeight > 1.25) return 1;
  if (due) return 2;
  return 3;
}

export function sortOpeningReviewQueue<T extends OpeningQueueItem>(items: readonly T[], now: Date): T[] {
  return [...items].sort((a, b) => {
    const tier = queueTier(a, now) - queueTier(b, now);
    if (tier !== 0) return tier;
    if (a.lapses !== b.lapses) return b.lapses - a.lapses;
    if (a.criticalWeight !== b.criticalWeight) return b.criticalWeight - a.criticalWeight;
    const aDue = a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDue = b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDue - bDue || a.id.localeCompare(b.id);
  });
}
