export type PlayEngineState = {
  fen: string;
  legalMoves: string[];
  engine: string;
};

async function requestPlay(body: { fen: string; move?: string }): Promise<PlayEngineState> {
  const response = await fetch("/api/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "ChessEngine play request failed");
  return payload as PlayEngineState;
}

export function fetchLegalMoves(fen: string) {
  return requestPlay({ fen });
}

export function playMove(fen: string, move: string) {
  return requestPlay({ fen, move });
}
