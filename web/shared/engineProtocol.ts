export type ParsedUciInfo = {
  depth: number;
  scoreCp: number;
  principalVariation: string;
};

export function normalizeDepth(requestedDepth: number) {
  if (!Number.isFinite(requestedDepth)) return 4;
  return Math.max(1, Math.min(8, Math.floor(requestedDepth)));
}

export function parseUciInfo(line: string): ParsedUciInfo {
  const depth = Number(line.match(/\bdepth\s+(\d+)/)?.[1] ?? 0);
  const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
  const scoreCp = scoreMatch
    ? scoreMatch[1] === "mate"
      ? Math.sign(Number(scoreMatch[2])) * 10_000
      : Number(scoreMatch[2])
    : 0;
  const principalVariation = line.match(/\bpv\s+(.+)$/)?.[1] ?? "";
  return { depth, scoreCp, principalVariation };
}
