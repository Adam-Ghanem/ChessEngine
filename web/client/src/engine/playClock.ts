export type ClockSnapshot = {
  whiteSeconds: number;
  blackSeconds: number;
};

function isClockSeconds(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function pluralize(value: number, singular: string) {
  return `${value} ${singular}${value === 1 ? "" : "s"}`;
}

export function clockAccessibleLabel(player: string, seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  const parts = [] as string[];

  if (minutes > 0) parts.push(pluralize(minutes, "minute"));
  if (remainingSeconds > 0 || minutes === 0) parts.push(pluralize(remainingSeconds, "second"));

  return `${player} clock, ${parts.join(" ")} remaining`;
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