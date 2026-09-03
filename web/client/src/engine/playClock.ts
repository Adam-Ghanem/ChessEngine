export function elapsedClockSeconds(previousTickMs: number, nowMs: number): number {
  if (!Number.isFinite(previousTickMs) || !Number.isFinite(nowMs) || nowMs <= previousTickMs) return 0;
  return Math.floor((nowMs - previousTickMs) / 1000);
}
