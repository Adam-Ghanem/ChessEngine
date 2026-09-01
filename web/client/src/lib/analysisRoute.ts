import { validateFenShape } from "@/engine/fen";

export function analysisHrefForFen(fen: string) {
  return `/analyze?fen=${encodeURIComponent(fen)}`;
}

export function initialAnalysisFenFromSearch(search: string, fallbackFen: string) {
  const queryFen = new URLSearchParams(search).get("fen");
  if (!queryFen) return fallbackFen;

  const validation = validateFenShape(queryFen);
  return validation.ok ? validation.fen : fallbackFen;
}
