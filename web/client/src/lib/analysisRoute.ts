import { validateFenShape } from "@/engine/fen";

const MAX_GAME_ID_LENGTH = 200;

export function analysisHrefForFen(fen: string) {
  return `/analyze?fen=${encodeURIComponent(fen)}`;
}

export function analysisHrefForGame(fen: string, gameId: string) {
  const params = new URLSearchParams({ fen, game: gameId });
  return `/analyze?${params.toString()}`;
}

export function initialAnalysisFenFromSearch(search: string, fallbackFen: string) {
  const queryFen = new URLSearchParams(search).get("fen");
  if (!queryFen) return fallbackFen;

  const validation = validateFenShape(queryFen);
  return validation.ok ? validation.fen : fallbackFen;
}

export function initialAnalysisGameIdFromSearch(search: string) {
  const gameId = new URLSearchParams(search).get("game")?.trim() ?? "";
  if (!gameId || gameId.length > MAX_GAME_ID_LENGTH) return null;
  return gameId;
}
