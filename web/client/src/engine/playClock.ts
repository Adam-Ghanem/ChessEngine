export type ClockSnapshot = {
  whiteSeconds: number;
  blackSeconds: number;
};

function isClockSeconds(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function elapsedClockSeconds(previousTickMs: number, nowMs: number): number {
  if (!Number.isFinite(previousTickMs) || !Number.isFinite(nowMs) || nowMs <= previousTickMs) return 0;
  return Math.floor((nowMs - previousTickMs) / 1000);
}

export function isClockSnapshot(value: unknown): value is ClockSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<ClockSnapshot>;
  return isClockSeconds(snapshot.whiteSeconds) && isClockSeconds(snapshot.blackSeconds);
}

export function clockSnapshotAfterUndo(history: readonly ClockSnapshot[], pliesToUndo: number): ClockSnapshot | null {
  if (!Number.isInteger(pliesToUndo) || pliesToUndo <= 0 || pliesToUndo >= history.length) return null;
  const snapshot = history[history.length - 1 - pliesToUndo];
  return snapshot && isClockSnapshot(snapshot) ? snapshot : null;
}