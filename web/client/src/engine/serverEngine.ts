export type ServerEngineAnalysis = {
  bestMove: string;
  scoreCp: number;
  depth: number;
  principalVariation: string;
  engine: string;
};

export function normalizeServerAnalysis(payload: unknown): ServerEngineAnalysis {
  if (!payload || typeof payload !== "object") throw new Error("Invalid ChessEngine response");
  const value = payload as Record<string, unknown>;
  if (
    typeof value.bestMove !== "string" || !value.bestMove ||
    typeof value.scoreCp !== "number" || !Number.isFinite(value.scoreCp) ||
    typeof value.depth !== "number" || !Number.isFinite(value.depth) ||
    typeof value.principalVariation !== "string" ||
    typeof value.engine !== "string" || !value.engine
  ) throw new Error("Invalid ChessEngine response");

  return {
    bestMove: value.bestMove,
    scoreCp: value.scoreCp,
    depth: value.depth,
    principalVariation: value.principalVariation,
    engine: value.engine,
  };
}

export async function analyzePosition(fen: string, depth = 4, signal?: AbortSignal): Promise<ServerEngineAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, depth }),
    signal,
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "ChessEngine analysis failed");
  }
  return normalizeServerAnalysis(payload);
}
