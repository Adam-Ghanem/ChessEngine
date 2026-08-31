export type FirstPartyEnginePayload = {
  bestMove: string;
  score: number;
  depth: number;
  nodes: number;
  pv: string;
};

type WirePayload = Partial<FirstPartyEnginePayload> & {
  ok?: boolean;
  error?: string;
};

export function parseEngineResponse(raw: string): FirstPartyEnginePayload {
  let payload: WirePayload;
  try {
    payload = JSON.parse(raw) as WirePayload;
  } catch {
    throw new Error("ChessEngine returned malformed JSON");
  }

  if (payload.ok === false) throw new Error(payload.error || "ChessEngine analysis failed");
  if (typeof payload.bestMove !== "string" || !payload.bestMove) throw new Error("ChessEngine response is missing bestMove");
  if (typeof payload.score !== "number" || !Number.isFinite(payload.score)) throw new Error("ChessEngine response is missing score");
  if (typeof payload.depth !== "number" || !Number.isFinite(payload.depth)) throw new Error("ChessEngine response is missing depth");
  if (typeof payload.nodes !== "number" || !Number.isFinite(payload.nodes)) throw new Error("ChessEngine response is missing nodes");
  if (typeof payload.pv !== "string") throw new Error("ChessEngine response is missing principal variation");

  return {
    bestMove: payload.bestMove,
    score: payload.score,
    depth: payload.depth,
    nodes: payload.nodes,
    pv: payload.pv,
  };
}
